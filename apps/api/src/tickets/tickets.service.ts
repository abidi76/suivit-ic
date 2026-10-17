import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CloturerTicketDto } from './dto/cloturer-ticket.dto';
import { AssignerTicketDto } from './dto/assigner-ticket.dto';
import { Criticite, Role, TicketStatut } from '../generated/prisma/client';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Genere un numero de ticket : TCK-YYYY-XXXX
   */
  private async genererNumeroTicket(): Promise<string> {
    const annee = new Date().getFullYear();
    const prefixe = `TCK-${annee}-`;
    const count = await this.prisma.ticket.count({
      where: { numero: { startsWith: prefixe } },
    });
    return `${prefixe}${String(count + 1).padStart(4, '0')}`;
  }

  /**
   * Regle 14.1 : declaration par l'etablissement.
   */
  async create(dto: CreateTicketDto, declarantId: string) {
    // Verifier l'etablissement
    const etablissement = await this.prisma.etablissement.findUnique({
      where: { id: dto.etablissementId },
    });
    if (!etablissement) {
      throw new BadRequestException('Etablissement introuvable.');
    }

    // Verifier le type de panne
    const typePanne = await this.prisma.typePanne.findUnique({
      where: { id: dto.typePanneId },
    });
    if (!typePanne) {
      throw new BadRequestException('Type de panne introuvable.');
    }

    // Verifier l'equipement (si fourni)
    if (dto.equipmentId) {
      const equipment = await this.prisma.equipment.findUnique({
        where: { id: dto.equipmentId },
      });
      if (!equipment) {
        throw new BadRequestException('Equipement introuvable.');
      }
    }

    const numero = await this.genererNumeroTicket();

    const ticket = await this.prisma.ticket.create({
      data: {
        numero,
        etablissementId: dto.etablissementId,
        laboId: dto.laboId || null,
        equipmentId: dto.equipmentId || null,
        declarantId,
        typePanneId: dto.typePanneId,
        criticite: dto.criticite || Criticite.MOYENNE,
        bacPratique: dto.bacPratique ?? false,
        description: dto.description,
        statut: TicketStatut.OUVERT,
      },
      include: {
        etablissement: true,
        declarant: { select: { id: true, nom: true, prenom: true, email: true } },
        typePanne: true,
        equipment: {
          include: { marque: true, modele: true, type: true },
        },
      },
    });

    // Regle 6.1 : si l'equipement est fourni, creer une Panne et mettre l'equipement en panne
    if (dto.equipmentId) {
      await this.prisma.$transaction([
        this.prisma.panne.create({
          data: {
            equipmentId: dto.equipmentId,
            typePanneId: dto.typePanneId,
            description: dto.description,
            declarantId,
            ticketId: ticket.id,
            statut: 'DECLAREE',
          },
        }),
        this.prisma.equipment.update({
          where: { id: dto.equipmentId },
          data: { etat: 'EN_PANNE' },
        }),
      ]);
    }

    return this.findOne(ticket.id);
  }

  /**
   * Liste des tickets avec filtres.
   * Regle 1.12 : cloisonnement par role.
   */
  async findAll(
    filters: {
      etablissementId?: string;
      statut?: TicketStatut;
      bacPratique?: boolean;
      criticite?: Criticite;
      declarantId?: string;
      technicienId?: string;
    },
    userRole: Role,
    userCreId: string | null,
    userEtablissementId: string | null,
    userId: string,
  ) {
    const where: any = {};

    if (filters.etablissementId) where.etablissementId = filters.etablissementId;
    if (filters.statut) where.statut = filters.statut;
    if (filters.bacPratique !== undefined) where.bacPratique = filters.bacPratique;
    if (filters.criticite) where.criticite = filters.criticite;
    if (filters.declarantId) where.declarantId = filters.declarantId;

    // Cloisonnement par role (regle 1.12)
    if (
      userRole === Role.SOUS_DIRECTEUR_TIC ||
      userRole === Role.SUPERVISEUR_LOCAL ||
      userRole === Role.CHEF_PARC ||
      userRole === Role.TECHNICIEN_INTERNE
    ) {
      if (userCreId) where.etablissement = { creId: userCreId };
    } else if (
      userRole === Role.DIRECTEUR_ETABLISSEMENT ||
      userRole === Role.PROF_RESPONSABLE
    ) {
      if (userEtablissementId) where.etablissementId = userEtablissementId;
    }

    // Filtrer par technicien (via interventions)
    if (filters.technicienId) {
      where.interventions = { some: { technicienId: filters.technicienId } };
    }

    return this.prisma.ticket.findMany({
      where,
      include: {
        etablissement: { include: { delegation: true, cre: true } },
        declarant: { select: { id: true, nom: true, prenom: true, email: true } },
        validePar: { select: { id: true, nom: true, prenom: true } },
        typePanne: true,
        equipment: { include: { marque: true, modele: true, type: true } },
        interventions: {
          include: {
            technicien: {
              select: { id: true, nom: true, prenom: true, email: true, role: true },
            },
            lignes: {
              include: {
                action: true,
                equipment: {
                  include: { marque: true, modele: true, type: true },
                },
                pieces: { include: { piece: true } },
              },
            },
          },
        },
        pannes: true,
      },
      orderBy: [
        { bacPratique: 'desc' },
        { criticite: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Fiche detaillee.
   */
  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        etablissement: { include: { delegation: true, cre: true } },
        declarant: {
          select: { id: true, nom: true, prenom: true, email: true, role: true },
        },
        validePar: { select: { id: true, nom: true, prenom: true } },
        typePanne: true,
        equipment: {
          include: { marque: true, modele: true, type: true },
        },
        pannes: { orderBy: { date: 'desc' } },
        interventions: {
          include: {
            technicien: {
              select: { id: true, nom: true, prenom: true, email: true, role: true },
            },
            lignes: {
              include: {
                action: true,
                equipment: {
                  include: { marque: true, modele: true, type: true },
                },
                pieces: { include: { piece: true } },
              },
            },
          },
        },
        missions: true,
        formatages: true,
      },
    });
    if (!ticket) throw new NotFoundException('Ticket introuvable.');
    return ticket;
  }

  /**
   * Modifier un ticket (statut, criticite).
   */
  async update(id: string, dto: UpdateTicketDto, userRole: Role) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket introuvable.');
    if (ticket.statut === TicketStatut.CLOTURE) {
      throw new BadRequestException('Impossible de modifier un ticket cloture.');
    }

    return this.prisma.ticket.update({
      where: { id },
      data: dto,
      include: {
        etablissement: true,
        typePanne: true,
        equipment: { include: { marque: true, modele: true, type: true } },
      },
    });
  }

  /**
   * Regle 14.2 : cloturer un ticket avec note de satisfaction.
   * Valide par le directeur.
   */
  async cloturer(
    id: string,
    dto: CloturerTicketDto,
    directeurId: string,
    userRole: Role,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { equipment: true },
    });
    if (!ticket) throw new NotFoundException('Ticket introuvable.');
    if (ticket.statut === TicketStatut.CLOTURE) {
      throw new BadRequestException('Ce ticket est deja cloture.');
    }

    // Verifier que le numero de serie correspond (si equipment lie)
    if (ticket.equipment && ticket.equipment.numeroSerie !== dto.numeroSerie) {
      throw new BadRequestException(
        `Le numero de serie ne correspond pas. Attendu : ${ticket.equipment.numeroSerie}`,
      );
    }

    // Verifier que le directeur est bien dans le perimetre
    if (
      userRole !== Role.ADMIN_CENTRAL &&
      userRole !== Role.DIRECTEUR_ETABLISSEMENT
    ) {
      throw new ForbiddenException('Seul le directeur peut cloturer un ticket.');
    }

    return this.prisma.ticket.update({
      where: { id },
      data: {
        statut: TicketStatut.CLOTURE,
        valideParId: directeurId,
        valideAt: new Date(),
        noteSatisfaction: dto.noteSatisfaction,
        commentaireCloture: dto.commentaireCloture || null,
        dateCloture: new Date(),
      },
      include: {
        etablissement: true,
        validePar: { select: { id: true, nom: true, prenom: true } },
        equipment: { include: { marque: true, modele: true, type: true } },
      },
    });
  }

  /**
   * Assigner un ticket a un technicien (via une intervention brouillon).
   * Regle 7.1 : le technicien choisit l'equipement.
   */
  async assigner(
    id: string,
    dto: AssignerTicketDto,
    assigneParId: string,
    userRole: Role,
  ) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket introuvable.');

    const technicien = await this.prisma.user.findUnique({
      where: { id: dto.technicienId },
    });
    if (!technicien) throw new NotFoundException('Technicien introuvable.');

    const rolesAutorises: Role[] = [
      Role.TECHNICIEN_INTERNE,
      Role.TECHNICIEN_PRESTATAIRE,
    ];
    if (!rolesAutorises.includes(technicien.role)) {
      throw new BadRequestException("Ce compte n'est pas un technicien.");
    }

    // Passer le ticket en EN_COURS
    await this.prisma.ticket.update({
      where: { id },
      data: { statut: TicketStatut.EN_COURS },
    });

    return this.findOne(id);
  }

  /**
   * Supprimer (annuler) un ticket (admin central uniquement).
   */
  async annuler(id: string, userRole: Role) {
    if (userRole !== Role.ADMIN_CENTRAL) {
      throw new ForbiddenException("Seul l'admin central peut annuler un ticket.");
    }

    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket introuvable.');
    if (ticket.statut === TicketStatut.CLOTURE) {
      throw new BadRequestException("Impossible d'annuler un ticket cloture.");
    }

    return this.prisma.ticket.update({
      where: { id },
      data: { statut: TicketStatut.ANNULE },
    });
  }

  /**
   * Statistiques des tickets.
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

    const [total, parStatut, parCriticite, bacPratique] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.groupBy({
        by: ['statut'],
        where,
        _count: { _all: true },
      }),
      this.prisma.ticket.groupBy({
        by: ['criticite'],
        where,
        _count: { _all: true },
      }),
      this.prisma.ticket.count({ where: { ...where, bacPratique: true } }),
    ]);

    return {
      total,
      bacPratique,
      parStatut: parStatut.map((s) => ({
        statut: s.statut,
        count: s._count._all,
      })),
      parCriticite: parCriticite.map((c) => ({
        criticite: c.criticite,
        count: c._count._all,
      })),
    };
  }
}