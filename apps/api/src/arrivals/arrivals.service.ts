import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArrivalDto } from './dto/create-arrival.dto';
import { ConfirmArrivalDto } from './dto/confirm-arrival.dto';
import { Role } from '../../generated/prisma/client';

const ROLES_CONFIRMATION: Role[] = [
  Role.SOUS_DIRECTEUR_TIC,
  Role.DIRECTEUR_ETABLISSEMENT,
  Role.PROF_RESPONSABLE,
];

@Injectable()
export class ArrivalsService {
  constructor(private prisma: PrismaService) {}

  private async genererNumeroArrivage(): Promise<string> {
    const annee = new Date().getFullYear();
    const prefixe = `ARR-${annee}-`;
    const count = await this.prisma.arrival.count({
      where: { numero: { startsWith: prefixe } },
    });
    return `${prefixe}${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: CreateArrivalDto, adminId: string) {
    const etablissement = await this.prisma.etablissement.findUnique({
      where: { id: dto.etablissementId },
    });
    if (!etablissement) {
      throw new BadRequestException('Etablissement introuvable.');
    }

    for (const item of dto.items) {
      const [marque, modele, type, ao] = await Promise.all([
        this.prisma.marque.findUnique({ where: { id: item.marqueId } }),
        this.prisma.modele.findUnique({ where: { id: item.modeleId } }),
        this.prisma.typeEquipement.findUnique({ where: { id: item.typeId } }),
        this.prisma.appelOffres.findUnique({ where: { id: item.appelOffresId } }),
      ]);
      if (!marque) throw new BadRequestException(`Marque introuvable : ${item.marqueId}`);
      if (!modele) throw new BadRequestException(`Modele introuvable : ${item.modeleId}`);
      if (!type) throw new BadRequestException(`Type introuvable : ${item.typeId}`);
      if (!ao) throw new BadRequestException(`Appel d'offres introuvable : ${item.appelOffresId}`);

      const existing = await this.prisma.equipment.findUnique({
        where: { numeroSerie: item.numeroSerie.trim() },
      });
      if (existing) {
        throw new BadRequestException(`Le numero de serie ${item.numeroSerie} existe deja.`);
      }
    }

    const numero = await this.genererNumeroArrivage();

    const arrival = await this.prisma.$transaction(async (tx) => {
      const newArrival = await tx.arrival.create({
        data: {
          numero,
          designation: dto.designation,
          bonLivraison: dto.bonLivraison || null,
          etablissementId: dto.etablissementId,
          adminId,
          statut: 'EN_ATTENTE',
          dateEcheance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        },
      });

      for (const item of dto.items) {
        let labo = await tx.labo.findFirst({
          where: { etablissementId: dto.etablissementId, actif: true },
        });
        if (!labo) {
          labo = await tx.labo.create({
            data: {
              nom: 'Labo par defaut',
              etablissementId: dto.etablissementId,
              actif: true,
            },
          });
        }

        const equipment = await tx.equipment.create({
          data: {
            numeroSerie: item.numeroSerie.trim(),
            marqueId: item.marqueId,
            modeleId: item.modeleId,
            typeId: item.typeId,
            appelOffresId: item.appelOffresId,
            lotId: item.lotId || null,
            etablissementId: dto.etablissementId,
            laboId: labo.id,
            etat: 'EN_ATTENTE_CONFIRMATION',
          },
        });

        await tx.arrivalItem.create({
          data: {
            arrivalId: newArrival.id,
            equipmentId: equipment.id,
            quantite: 1,
          },
        });
      }

      return newArrival;
    });

    return this.findOne(arrival.id);
  }

  async findAll(userRole: Role, creId: string | null, etablissementId: string | null) {
    const where: any = {};

    if (userRole !== Role.ADMIN_CENTRAL && userRole !== Role.ADMIN_ADJOINT) {
      if (creId) {
        where.etablissement = { creId };
      }
      if (etablissementId) {
        where.etablissementId = etablissementId;
      }
    }

    return this.prisma.arrival.findMany({
      where,
      include: {
        etablissement: { include: { delegation: true, cre: true } },
        items: {
          include: {
            equipment: {
              include: { marque: true, modele: true, type: true },
            },
          },
        },
        confirmations: true,
        litiges: true,
      },
      orderBy: { dateArrivee: 'desc' },
    });
  }

  async findOne(id: string) {
    const arrival = await this.prisma.arrival.findUnique({
      where: { id },
      include: {
        etablissement: { include: { delegation: true, cre: true } },
        items: {
          include: {
            equipment: {
              include: { marque: true, modele: true, type: true, appelOffres: true },
            },
          },
        },
        confirmations: true,
        litiges: true,
      },
    });
    if (!arrival) throw new NotFoundException('Arrivage introuvable.');
    return arrival;
  }

  async confirmer(id: string, dto: ConfirmArrivalDto, userId: string, userRole: Role) {
    if (!ROLES_CONFIRMATION.includes(userRole)) {
      throw new ForbiddenException(
        `Le role ${userRole} n'est pas autorise a confirmer un arrivage.`,
      );
    }

    if (dto.avecReserve && !dto.motif) {
      throw new BadRequestException('Le motif est obligatoire en cas de reserve.');
    }

    const arrival = await this.prisma.arrival.findUnique({
      where: { id },
    });
    if (!arrival) throw new NotFoundException('Arrivage introuvable.');
    if (arrival.statut === 'CONFIRME') {
      throw new BadRequestException('Cet arrivage est deja confirme.');
    }

    await this.prisma.arrivalConfirmation.upsert({
      where: {
        arrivalId_userId: { arrivalId: id, userId },
      },
      create: {
        arrivalId: id,
        userId,
        role: userRole,
        avecReserve: dto.avecReserve ?? false,
        motif: dto.motif || null,
      },
      update: {
        avecReserve: dto.avecReserve ?? false,
        motif: dto.motif || null,
        date: new Date(),
      },
    });

    if (dto.avecReserve) {
      await this.prisma.arrivalLitige.create({
        data: {
          arrivalId: id,
          motif: dto.motif!,
        },
      });
      await this.prisma.arrival.update({
        where: { id },
        data: { statut: 'EN_LITIGE' },
      });
      return this.findOne(id);
    }

    const confirmations = await this.prisma.arrivalConfirmation.findMany({
      where: { arrivalId: id, avecReserve: false },
      select: { role: true },
    });
    const rolesConfirmes = new Set(confirmations.map((c) => c.role));
    const toutesPresentes = ROLES_CONFIRMATION.every((r) => rolesConfirmes.has(r));

    if (toutesPresentes) {
      const items = await this.prisma.arrivalItem.findMany({
        where: { arrivalId: id },
      });
      for (const item of items) {
        await this.prisma.equipment.update({
          where: { id: item.equipmentId },
          data: { etat: 'FONCTIONNEL' },
        });
      }
      await this.prisma.arrival.update({
        where: { id },
        data: {
          statut: 'CONFIRME',
          dateConfirmation: new Date(),
        },
      });
    }

    return this.findOne(id);
  }

  async createRectificatif(arrivalId: string, dto: CreateArrivalDto, adminId: string) {
    const original = await this.prisma.arrival.findUnique({ where: { id: arrivalId } });
    if (!original) throw new NotFoundException('Arrivage original introuvable.');
    if (original.statut !== 'CONFIRME') {
      throw new BadRequestException('Seul un arrivage confirme peut etre rectifie.');
    }

    const rectificatif = await this.create(dto, adminId);

    await this.prisma.arrival.update({
      where: { id: rectificatif.id },
      data: { rectificatifDe: original.id },
    });

    return this.findOne(rectificatif.id);
  }

  async traiterLitige(litigeId: string, adminId: string, resolution: string) {
    const litige = await this.prisma.arrivalLitige.findUnique({
      where: { id: litigeId },
    });
    if (!litige) throw new NotFoundException('Litige introuvable.');
    if (litige.traite) throw new BadRequestException('Ce litige est deja traite.');

    return this.prisma.arrivalLitige.update({
      where: { id: litigeId },
      data: {
        traite: true,
        traiteParId: adminId,
        traiteAt: new Date(),
        resolution,
      },
    });
  }
}