import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';
import { CreateLigneDto } from './dto/create-ligne.dto';
import { UpdateLigneDto } from './dto/update-ligne.dto';
import { AddPieceDto } from './dto/add-piece.dto';
import { ValiderInterventionDto } from './dto/valider-intervention.dto';
import { RefuserInterventionDto } from './dto/refuser-intervention.dto';
import { InterventionStatut, Role } from '../../generated/prisma/client';

@Injectable()
export class InterventionsService {
  constructor(private prisma: PrismaService) {}

  // ===========================================================================
  // CREATION
  // ===========================================================================

  /**
   * Regle 7.1, 7.2, 7.3 : creer une fiche d'intervention multi-equipements.
   */
  async create(dto: CreateInterventionDto, user: any) {
    const etablissement = await this.prisma.etablissement.findUnique({
      where: { id: dto.etablissementId },
    });
    if (!etablissement) {
      throw new BadRequestException('Etablissement introuvable.');
    }

    // Regle 7.3 : verifier le perimetre du technicien
    if (user.role === Role.TECHNICIEN_INTERNE) {
      if (etablissement.creId !== user.creId) {
        throw new ForbiddenException("Cet etablissement n'est pas dans votre CRE.");
      }
    } else if (user.role === Role.TECHNICIEN_PRESTATAIRE) {
      if (user.etablissementId && etablissement.id !== user.etablissementId) {
        throw new ForbiddenException("Vous n'etes pas mandate sur cet etablissement.");
      }
    } else if (user.role !== Role.ADMIN_CENTRAL) {
      throw new ForbiddenException('Role non autorise a creer une intervention.');
    }

    // Verifier les equipements
    const equipmentIds = dto.lignes.map((l) => l.equipmentId);
    const equipments = await this.prisma.equipment.findMany({
      where: { id: { in: equipmentIds } },
    });
    if (equipments.length !== equipmentIds.length) {
      throw new BadRequestException('Un ou plusieurs equipements sont introuvables.');
    }
    for (const eq of equipments) {
      if (eq.etablissementId !== dto.etablissementId) {
        throw new BadRequestException(
          `L'equipement ${eq.numeroSerie} n'appartient pas a cet etablissement.`,
        );
      }
    }

    // Verifier les actions
    const actionIds = dto.lignes.map((l) => l.actionId);
    const actions = await this.prisma.actionMaintenance.findMany({
      where: { id: { in: actionIds } },
    });
    if (actions.length !== actionIds.length) {
      throw new BadRequestException('Une ou plusieurs actions sont introuvables.');
    }

    // Verifier le ticket
    if (dto.ticketId) {
      const ticket = await this.prisma.ticket.findUnique({
        where: { id: dto.ticketId },
      });
      if (!ticket) throw new BadRequestException('Ticket introuvable.');
      if (ticket.etablissementId !== dto.etablissementId) {
        throw new BadRequestException("Le ticket n'appartient pas a cet etablissement.");
      }
    }

    // Reference unique
    const count = await this.prisma.intervention.count();
    const annee = new Date().getFullYear();
    const reference = `INT-${annee}-${String(count + 1).padStart(4, '0')}`;

    // Creation
    const intervention = await this.prisma.intervention.create({
      data: {
        reference,
        etablissementId: dto.etablissementId,
        technicienId: user.id,
        ticketId: dto.ticketId || null,
        description: dto.description || null,
        statut: InterventionStatut.BROUILLON,
        lignes: {
          create: dto.lignes.map((ligne) => ({
            equipmentId: ligne.equipmentId,
            actionId: ligne.actionId,
            commentaire: ligne.commentaire || null,
            pieces: ligne.pieces
              ? {
                  create: ligne.pieces.map((p) => ({
                    numeroSerie: p.numeroSerie.trim(),
                    designation: p.designation,
                    pieceId: p.pieceId || null,
                    ajoutee: p.ajoutee,
                  })),
                }
              : undefined,
          })),
        },
      },
      include: this.defaultInclude(),
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'INTERVENTION_CREEE',
        entite: 'Intervention',
        entiteId: intervention.id,
        apres: intervention as any,
      },
    });

    return intervention;
  }

  // ===========================================================================
  // LECTURE
  // ===========================================================================

  async findAll(
    filters: {
      statut?: InterventionStatut;
      technicienId?: string;
      equipmentId?: string;
      ticketId?: string;
      etablissementId?: string;
    },
    user: any,
  ) {
    const where: any = {};

    if (filters.statut) where.statut = filters.statut;
    if (filters.ticketId) where.ticketId = filters.ticketId;
    if (filters.equipmentId) {
      where.lignes = { some: { equipmentId: filters.equipmentId } };
    }

    if (
      user.role === Role.TECHNICIEN_INTERNE ||
      user.role === Role.TECHNICIEN_PRESTATAIRE
    ) {
      where.technicienId = filters.technicienId || user.id;
    } else if (filters.technicienId) {
      where.technicienId = filters.technicienId;
    }

    if (
      user.role === Role.SOUS_DIRECTEUR_TIC ||
      user.role === Role.SUPERVISEUR_LOCAL ||
      user.role === Role.CHEF_PARC
    ) {
      if (user.creId) where.etablissement = { creId: user.creId };
    }

    if (user.role === Role.DIRECTEUR_ETABLISSEMENT && user.etablissementId) {
      where.etablissementId = user.etablissementId;
    }

    if (filters.etablissementId) where.etablissementId = filters.etablissementId;

    return this.prisma.intervention.findMany({
      where,
      include: this.defaultInclude(),
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const intervention = await this.prisma.intervention.findUnique({
      where: { id },
      include: {
        etablissement: true,
        technicien: {
          select: { id: true, nom: true, prenom: true, email: true, role: true },
        },
        ticket: true,
        lignes: {
          include: {
            equipment: {
              include: { marque: true, modele: true, type: true, labo: true },
            },
            action: true,
            pieces: { include: { piece: true } },
          },
        },
      },
    });
    if (!intervention) throw new NotFoundException('Intervention introuvable.');
    return intervention;
  }

  // ===========================================================================
  // MODIFICATION
  // ===========================================================================

  async update(id: string, dto: UpdateInterventionDto, userId: string) {
    const intervention = await this.prisma.intervention.findUnique({ where: { id } });
    if (!intervention) throw new NotFoundException('Intervention introuvable.');
    if (intervention.technicienId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres interventions.');
    }
    if (intervention.statut !== InterventionStatut.BROUILLON) {
      throw new BadRequestException(
        'Seules les interventions en brouillon peuvent etre modifiees.',
      );
    }

    return this.prisma.intervention.update({
      where: { id },
      data: {
        ticketId: dto.ticketId ?? undefined,
        description: dto.description ?? undefined,
      },
      include: this.defaultInclude(),
    });
  }

  // ===========================================================================
  // LIGNES
  // ===========================================================================

  async addLigne(interventionId: string, dto: CreateLigneDto, userId: string) {
    const intervention = await this.prisma.intervention.findUnique({
      where: { id: interventionId },
    });
    if (!intervention) throw new NotFoundException('Intervention introuvable.');
    if (intervention.technicienId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres interventions.');
    }
    if (intervention.statut !== InterventionStatut.BROUILLON) {
      throw new BadRequestException(
        'Seules les interventions en brouillon peuvent etre modifiees.',
      );
    }

    const equipment = await this.prisma.equipment.findUnique({
      where: { id: dto.equipmentId },
    });
    if (!equipment) throw new BadRequestException('Equipement introuvable.');
    if (equipment.etablissementId !== intervention.etablissementId) {
      throw new BadRequestException(
        "Cet equipement n'appartient pas a l'etablissement de l'intervention.",
      );
    }

    const action = await this.prisma.actionMaintenance.findUnique({
      where: { id: dto.actionId },
    });
    if (!action) throw new BadRequestException('Action de maintenance introuvable.');

    return this.prisma.interventionLigne.create({
      data: {
        interventionId,
        equipmentId: dto.equipmentId,
        actionId: dto.actionId,
        commentaire: dto.commentaire || null,
      },
      include: {
        equipment: { include: { marque: true, modele: true, type: true } },
        action: true,
        pieces: true,
      },
    });
  }

  async updateLigne(ligneId: string, dto: UpdateLigneDto, userId: string) {
    const ligne = await this.prisma.interventionLigne.findUnique({
      where: { id: ligneId },
      include: { intervention: true },
    });
    if (!ligne) throw new NotFoundException('Ligne introuvable.');
    if (ligne.intervention.technicienId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres interventions.');
    }
    if (ligne.intervention.statut !== InterventionStatut.BROUILLON) {
      throw new BadRequestException(
        'Seules les interventions en brouillon peuvent etre modifiees.',
      );
    }

    if (dto.equipmentId && dto.equipmentId !== ligne.equipmentId) {
      const equipment = await this.prisma.equipment.findUnique({
        where: { id: dto.equipmentId },
      });
      if (!equipment) throw new BadRequestException('Equipement introuvable.');
      if (equipment.etablissementId !== ligne.intervention.etablissementId) {
        throw new BadRequestException(
          "Cet equipement n'appartient pas a l'etablissement de l'intervention.",
        );
      }
    }

    return this.prisma.interventionLigne.update({
      where: { id: ligneId },
      data: {
        equipmentId: dto.equipmentId ?? undefined,
        actionId: dto.actionId ?? undefined,
        commentaire: dto.commentaire ?? undefined,
      },
      include: {
        equipment: { include: { marque: true, modele: true, type: true } },
        action: true,
        pieces: true,
      },
    });
  }

  async removeLigne(ligneId: string, userId: string) {
    const ligne = await this.prisma.interventionLigne.findUnique({
      where: { id: ligneId },
      include: { intervention: true },
    });
    if (!ligne) throw new NotFoundException('Ligne introuvable.');
    if (ligne.intervention.technicienId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres interventions.');
    }
    if (ligne.intervention.statut !== InterventionStatut.BROUILLON) {
      throw new BadRequestException(
        'Seules les interventions en brouillon peuvent etre modifiees.',
      );
    }

    await this.prisma.interventionLigne.delete({ where: { id: ligneId } });
    return { success: true };
  }

  // ===========================================================================
  // PIECES
  // ===========================================================================

  async addPiece(ligneId: string, dto: AddPieceDto, userId: string) {
    const ligne = await this.prisma.interventionLigne.findUnique({
      where: { id: ligneId },
      include: { intervention: true },
    });
    if (!ligne) throw new NotFoundException('Ligne introuvable.');
    if (ligne.intervention.technicienId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres interventions.');
    }
    if (ligne.intervention.statut !== InterventionStatut.BROUILLON) {
      throw new BadRequestException(
        'Seules les interventions en brouillon peuvent etre modifiees.',
      );
    }

    const trimmed = dto.numeroSerie.trim();
    const existing = await this.prisma.interventionPiece.findFirst({
      where: { numeroSerie: trimmed, ajoutee: true },
    });
    if (existing && dto.ajoutee) {
      throw new BadRequestException(
        `Le numero de serie ${trimmed} est deja utilise pour une piece ajoutee.`,
      );
    }

    if (dto.pieceId) {
      const piece = await this.prisma.piece.findUnique({
        where: { id: dto.pieceId },
      });
      if (!piece) throw new BadRequestException('Piece introuvable.');
    }

    return this.prisma.interventionPiece.create({
      data: {
        interventionLigneId: ligneId,
        pieceId: dto.pieceId || null,
        numeroSerie: trimmed,
        designation: dto.designation,
        ajoutee: dto.ajoutee,
      },
      include: { piece: true },
    });
  }

  async removePiece(pieceId: string, userId: string) {
    const piece = await this.prisma.interventionPiece.findUnique({
      where: { id: pieceId },
      include: { interventionLigne: { include: { intervention: true } } },
    });
    if (!piece) throw new NotFoundException('Piece introuvable.');
    if (piece.interventionLigne.intervention.technicienId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres interventions.');
    }
    if (
      piece.interventionLigne.intervention.statut !== InterventionStatut.BROUILLON
    ) {
      throw new BadRequestException(
        'Seules les interventions en brouillon peuvent etre modifiees.',
      );
    }

    await this.prisma.interventionPiece.delete({ where: { id: pieceId } });
    return { success: true };
  }

  // ===========================================================================
  // SOUMISSION
  // ===========================================================================

  async soumettre(id: string, userId: string) {
    const intervention = await this.prisma.intervention.findUnique({
      where: { id },
      include: { lignes: true },
    });
    if (!intervention) throw new NotFoundException('Intervention introuvable.');
    if (intervention.technicienId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres interventions.');
    }
    if (intervention.statut !== InterventionStatut.BROUILLON) {
      throw new BadRequestException("Cette intervention n'est plus en brouillon.");
    }
    if (intervention.lignes.length === 0) {
      throw new BadRequestException(
        'Une intervention doit contenir au moins une ligne avant soumission.',
      );
    }

    const updated = await this.prisma.intervention.update({
      where: { id },
      data: { statut: InterventionStatut.EN_ATTENTE_VALIDATION },
      include: this.defaultInclude(),
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'INTERVENTION_SOUMISE',
        entite: 'Intervention',
        entiteId: id,
        apres: updated as any,
      },
    });

    return updated;
  }

  // ===========================================================================
  // VALIDATION / REFUS
  // ===========================================================================

  async valider(id: string, dto: ValiderInterventionDto, user: any) {
    if (
      user.role !== Role.DIRECTEUR_ETABLISSEMENT &&
      user.role !== Role.ADMIN_CENTRAL
    ) {
      throw new ForbiddenException('Seul le directeur peut valider une intervention.');
    }

    const intervention = await this.prisma.intervention.findUnique({
      where: { id },
      include: {
        lignes: { include: { pieces: true } },
        ticket: true,
      },
    });
    if (!intervention) throw new NotFoundException('Intervention introuvable.');
    if (intervention.statut !== InterventionStatut.EN_ATTENTE_VALIDATION) {
      throw new BadRequestException(
        "Cette intervention n'est pas en attente de validation.",
      );
    }

    // Regle 7.7 : perimetre du directeur
    if (user.role === Role.DIRECTEUR_ETABLISSEMENT) {
      if (intervention.etablissementId !== user.etablissementId) {
        throw new ForbiddenException(
          'Vous ne pouvez valider que les interventions de votre etablissement.',
        );
      }
    }

    const updated = await this.prisma.intervention.update({
      where: { id },
      data: {
        statut: InterventionStatut.VALIDE,
        valideParDirId: user.id,
        valideAt: new Date(),
      },
      include: this.defaultInclude(),
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'INTERVENTION_VALIDEE',
        entite: 'Intervention',
        entiteId: id,
        apres: updated as any,
      },
    });

    return updated;
  }

  async refuser(id: string, dto: RefuserInterventionDto, user: any) {
    if (
      user.role !== Role.DIRECTEUR_ETABLISSEMENT &&
      user.role !== Role.ADMIN_CENTRAL
    ) {
      throw new ForbiddenException('Seul le directeur peut refuser une intervention.');
    }

    const intervention = await this.prisma.intervention.findUnique({
      where: { id },
    });
    if (!intervention) throw new NotFoundException('Intervention introuvable.');
    if (intervention.statut !== InterventionStatut.EN_ATTENTE_VALIDATION) {
      throw new BadRequestException(
        "Cette intervention n'est pas en attente de validation.",
      );
    }

    // Regle 7.7 : perimetre du directeur
    if (user.role === Role.DIRECTEUR_ETABLISSEMENT) {
      if (intervention.etablissementId !== user.etablissementId) {
        throw new ForbiddenException(
          'Vous ne pouvez refuser que les interventions de votre etablissement.',
        );
      }
    }

    const updated = await this.prisma.intervention.update({
      where: { id },
      data: {
        statut: InterventionStatut.REFUSE,
        valideParDirId: user.id,
        valideAt: new Date(),
        motifRefus: dto.motif,
      },
      include: this.defaultInclude(),
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'INTERVENTION_REFUSEE',
        entite: 'Intervention',
        entiteId: id,
        apres: updated as any,
      },
    });

    return updated;
  }

  // ===========================================================================
  // INCLUDE PAR DEFAUT
  // ===========================================================================

  private defaultInclude() {
    return {
      etablissement: true,
      technicien: {
        select: { id: true, nom: true, prenom: true, email: true, role: true },
      },
      ticket: true,
      lignes: {
        include: {
          equipment: { include: { marque: true, modele: true, type: true } },
          action: true,
          pieces: { include: { piece: true } },
        },
      },
    };
  }
}