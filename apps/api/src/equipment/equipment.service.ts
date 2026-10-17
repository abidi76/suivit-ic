import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { ReformerEquipmentDto } from './dto/reformer-equipment.dto';
import { EquipmentState, Role } from '../generated/prisma/client';

export interface EquipmentFilters {
  etablissementId?: string;
  laboId?: string;
  typeId?: string;
  marqueId?: string;
  etat?: EquipmentState;
  proprietaireId?: string;
  search?: string;
}

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Liste les equipements avec filtres et pagination.
   * Regle 1.12 : filtre par perimetre (CRE, etablissement)
   */
  async findAll(
    filters: EquipmentFilters,
    userRole: Role,
    userCreId: string | null,
    userEtablissementId: string | null,
    userLaboId: string | null,
    page = 1,
    limit = 50,
  ) {
    const where: any = {};

    // Filtres utilisateur (passes en parametres)
    if (filters.etablissementId) where.etablissementId = filters.etablissementId;
    if (filters.laboId) where.laboId = filters.laboId;
    if (filters.typeId) where.typeId = filters.typeId;
    if (filters.marqueId) where.marqueId = filters.marqueId;
    if (filters.etat) where.etat = filters.etat;
    if (filters.proprietaireId) where.proprietaireId = filters.proprietaireId;

    if (filters.search) {
      where.OR = [
        { numeroSerie: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Regle 1.12 : cloisonnement par role
    if (
      userRole === Role.SOUS_DIRECTEUR_TIC ||
      userRole === Role.SUPERVISEUR_LOCAL ||
      userRole === Role.CHEF_PARC ||
      userRole === Role.TECHNICIEN_INTERNE
    ) {
      if (userCreId) {
        where.etablissement = { creId: userCreId };
      }
    }

    if (userRole === Role.DIRECTEUR_ETABLISSEMENT && userEtablissementId) {
      where.etablissementId = userEtablissementId;
    }

    if (userRole === Role.PROF_RESPONSABLE && userLaboId) {
      where.laboId = userLaboId;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.equipment.findMany({
        where,
        include: {
          marque: true,
          modele: true,
          type: true,
          etablissement: { include: { delegation: true, cre: true } },
          labo: true,
          appelOffres: true,
        },
        orderBy: { numeroSerie: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.equipment.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Fiche detaillee d'un equipement.
   */
  async findOne(id: string) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id },
      include: {
        marque: true,
        modele: true,
        type: true,
        etablissement: { include: { delegation: true, cre: true } },
        labo: true,
        appelOffres: true,
        lot: true,
        arriveeItem: { include: { arrival: true } },
        pannes: { orderBy: { date: 'desc' } },
        pertes: { orderBy: { date: 'desc' } },
        dommagesTotaux: { orderBy: { date: 'desc' } },
        interventionLignes: {
          include: {
            intervention: {
              include: {
                technicien: {
                  select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    email: true,
                    role: true,
                  },
                },
                ticket: true,
              },
            },
            action: true,
            pieces: {
              include: { piece: true },
            },
          },
          orderBy: {
            intervention: { date: 'desc' },
          },
        },
        pretItem: { include: { pret: true } },
        inventaireLignes: { orderBy: { dateDeclaration: 'desc' }, take: 5 },
      },
    });
    if (!equipment) throw new NotFoundException('Equipement introuvable.');
    return equipment;
  }

  /**
   * Statistiques par etat, type, marque.
   * Regle 11.2 : ventilation des chiffres.
   */
  async stats(
    userRole: Role,
    userCreId: string | null,
    userEtablissementId: string | null,
  ) {
    const where: any = {};

    if (
      userRole === Role.SOUS_DIRECTEUR_TIC ||
      userRole === Role.SUPERVISEUR_LOCAL ||
      userRole === Role.CHEF_PARC ||
      userRole === Role.TECHNICIEN_INTERNE
    ) {
      if (userCreId) where.etablissement = { creId: userCreId };
    }

    if (userRole === Role.DIRECTEUR_ETABLISSEMENT && userEtablissementId) {
      where.etablissementId = userEtablissementId;
    }

    const [total, parEtat, parType, parMarque, parEtablissement] =
      await Promise.all([
        this.prisma.equipment.count({ where }),
        this.prisma.equipment.groupBy({
          by: ['etat'],
          where,
          _count: { _all: true },
        }),
        this.prisma.equipment.groupBy({
          by: ['typeId'],
          where,
          _count: { _all: true },
        }),
        this.prisma.equipment.groupBy({
          by: ['marqueId'],
          where,
          _count: { _all: true },
        }),
        this.prisma.equipment.groupBy({
          by: ['etablissementId'],
          where,
          _count: { _all: true },
        }),
      ]);

    // Enrichir les IDs avec les noms
    const typeIds = parType.map((t) => t.typeId);
    const marqueIds = parMarque.map((m) => m.marqueId);
    const etabIds = parEtablissement.map((e) => e.etablissementId);

    const [types, marques, etablissements] = await Promise.all([
      this.prisma.typeEquipement.findMany({
        where: { id: { in: typeIds } },
        select: { id: true, nom: true },
      }),
      this.prisma.marque.findMany({
        where: { id: { in: marqueIds } },
        select: { id: true, nom: true },
      }),
      this.prisma.etablissement.findMany({
        where: { id: { in: etabIds } },
        select: { id: true, code: true, nomFr: true },
      }),
    ]);

    const typeMap = Object.fromEntries(types.map((t) => [t.id, t.nom]));
    const marqueMap = Object.fromEntries(marques.map((m) => [m.id, m.nom]));
    const etabMap = Object.fromEntries(
      etablissements.map((e) => [e.id, `${e.code} - ${e.nomFr}`]),
    );

    return {
      total,
      parEtat: parEtat.map((e) => ({ etat: e.etat, count: e._count._all })),
      parType: parType.map((t) => ({
        type: typeMap[t.typeId] || t.typeId,
        count: t._count._all,
      })),
      parMarque: parMarque.map((m) => ({
        marque: marqueMap[m.marqueId] || m.marqueId,
        count: m._count._all,
      })),
      parEtablissement: parEtablissement.map((e) => ({
        etablissement: etabMap[e.etablissementId] || e.etablissementId,
        count: e._count._all,
      })),
    };
  }

  /**
   * Modifier un equipement (etat, labo).
   * Seul l'admin central peut modifier les champs critiques.
   */
  async update(id: string, dto: UpdateEquipmentDto, userRole: Role) {
    const equipment = await this.prisma.equipment.findUnique({ where: { id } });
    if (!equipment) throw new NotFoundException('Equipement introuvable.');

    // Regle 3.5 : on ne supprime jamais, on reforme
    if (dto.etat === EquipmentState.REFORME) {
      if (userRole !== Role.ADMIN_CENTRAL) {
        throw new ForbiddenException(
          "Seul l'admin central peut reformer un equipement.",
        );
      }
      if (!dto.motifReforme) {
        throw new BadRequestException('Le motif de reforme est obligatoire.');
      }
    }

    const data: any = {};
    if (dto.etat) data.etat = dto.etat;
    if (dto.laboId) data.laboId = dto.laboId;
    if (dto.motifReforme) {
      data.motifReforme = dto.motifReforme;
      data.dateReforme = new Date();
    }

    return this.prisma.equipment.update({
      where: { id },
      data,
      include: {
        marque: true,
        modele: true,
        type: true,
        etablissement: true,
        labo: true,
      },
    });
  }

  /**
   * Reforme un equipement (regle 3.5 : jamais supprime).
   */
  async reformer(id: string, dto: ReformerEquipmentDto, userRole: Role) {
    if (userRole !== Role.ADMIN_CENTRAL) {
      throw new ForbiddenException(
        "Seul l'admin central peut reformer un equipement.",
      );
    }

    const equipment = await this.prisma.equipment.findUnique({ where: { id } });
    if (!equipment) throw new NotFoundException('Equipement introuvable.');
    if (equipment.etat === EquipmentState.REFORME) {
      throw new BadRequestException('Cet equipement est deja reforme.');
    }

    return this.prisma.equipment.update({
      where: { id },
      data: {
        etat: EquipmentState.REFORME,
        motifReforme: dto.motif,
        dateReforme: new Date(),
      },
      include: {
        marque: true,
        modele: true,
        type: true,
        etablissement: true,
        labo: true,
      },
    });
  }

  /**
   * Recherche par numero de serie (utilise par les interventions).
   */
  async findByNumeroSerie(numeroSerie: string) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { numeroSerie },
      include: {
        marque: true,
        modele: true,
        type: true,
        etablissement: true,
        labo: true,
      },
    });
    if (!equipment) throw new NotFoundException('Equipement introuvable.');
    return equipment;
  }
}