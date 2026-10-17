import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../auth/audit.service';
import { CreateReclamationDto } from './dto/create-reclamation.dto';
import { AssignTrajetDto } from './dto/assign-trajet.dto';
import { DiagnosticTechnicienDto } from './dto/diagnostic-technicien.dto';
import { DecisionSdTicDto } from './dto/decision-sd-tic.dto';
import { ReclamationStatut, Role } from '../generated/prisma/client';

@Injectable()
export class ReclamationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // Génère une référence unique ex: REC-2026-0001
  private async generateReference(): Promise<string> {
    const count = await this.prisma.reclamationConnexion.count();
    const year = new Date().getFullYear();
    return `REC-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: CreateReclamationDto, actor: any) {
    const circuit = await this.prisma.circuitReseau.findUnique({
      where: { id: dto.circuitId },
    });
    if (!circuit) throw new NotFoundException('Circuit introuvable.');

    const reference = await this.generateReference();

    const reclamation = await this.prisma.reclamationConnexion.create({
      data: {
        reference,
        circuitId: dto.circuitId,
        etablissementId: circuit.etablissementId,
        declarantId: actor.userId,
        description: dto.description,
        statut: ReclamationStatut.DECLAREE,
      },
      include: { circuit: true, etablissement: true },
    });

    await this.audit.log({
      userId: actor.userId,
      action: 'CREATE',
      entite: 'ReclamationConnexion',
      entiteId: reclamation.id,
      apres: reclamation,
    });

    return reclamation;
  }

  async findAll(actor: any) {
    const where: any = {};
    
    // Scoping : un Directeur ou Prof ne voit que son établissement
    if (actor.role === Role.DIRECTEUR_ETABLISSEMENT || actor.role === Role.PROF_RESPONSABLE) {
      where.etablissementId = actor.etablissementId;
    }

    return this.prisma.reclamationConnexion.findMany({
      where,
      include: {
        circuit: { include: { typeConnexion: true } },
        etablissement: true,
        declarant: { select: { nom: true, prenom: true } },
        technicien: { select: { nom: true, prenom: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  // Étape SD-TIC : Rattacher à un trajet
  async assignTrajet(id: string, dto: AssignTrajetDto, actor: any) {
    const rec = await this.prisma.reclamationConnexion.findUnique({ where: { id } });
    if (!rec) throw new NotFoundException('Réclamation introuvable.');
    if (rec.statut !== ReclamationStatut.DECLAREE) {
      throw new BadRequestException('Cette réclamation a déjà été traitée ou rattachée.');
    }

    const updated = await this.prisma.reclamationConnexion.update({
      where: { id },
      data: {
        trajetId: dto.trajetId,
        destinationId: dto.destinationId,
        statut: ReclamationStatut.RATTACHEE_TRAJET,
      },
    });

    await this.audit.log({
      userId: actor.userId,
      action: 'UPDATE',
      entite: 'ReclamationConnexion',
      entiteId: id,
      avant: { statut: rec.statut },
      apres: { statut: updated.statut, trajetId: dto.trajetId },
    });

    return updated;
  }

  // Étape Technicien : Diagnostic
  async diagnosticTechnicien(id: string, dto: DiagnosticTechnicienDto, actor: any) {
    const rec = await this.prisma.reclamationConnexion.findUnique({ where: { id } });
    if (!rec) throw new NotFoundException('Réclamation introuvable.');

    const updated = await this.prisma.reclamationConnexion.update({
      where: { id },
      data: {
        technicienId: actor.userId,
        dateIntervention: new Date(),
        commentaireTechnicien: dto.commentaireTechnicien,
        clotureParTechnicien: dto.clotureParTechnicien,
        statut: ReclamationStatut.EN_COURS,
        actions: {
          create: dto.actions?.map(a => ({ actionId: a.actionId, description: a.description })),
        },
        pieces: {
          create: dto.pieces?.map(p => ({ numeroSerie: p.numeroSerie, designation: p.designation, ajoutee: p.ajoutee })),
        },
      },
      include: { actions: true, pieces: true },
    });

    await this.audit.log({
      userId: actor.userId,
      action: 'UPDATE',
      entite: 'ReclamationConnexion',
      entiteId: id,
      apres: { statut: updated.statut, diagnostic: true },
    });

    return updated;
  }

  // Étape SD-TIC : Décision finale (Ajournée, Annulée, Clôturée)
  async decisionSdTic(id: string, dto: DecisionSdTicDto, actor: any) {
    const rec = await this.prisma.reclamationConnexion.findUnique({ where: { id } });
    if (!rec) throw new NotFoundException('Réclamation introuvable.');

    const updated = await this.prisma.reclamationConnexion.update({
      where: { id },
      data: {
        statut: dto.statut,
        motifDecision: dto.motifDecision,
        decisionParId: actor.userId,
        decisionAt: new Date(),
      },
    });

    await this.audit.log({
      userId: actor.userId,
      action: 'UPDATE',
      entite: 'ReclamationConnexion',
      entiteId: id,
      avant: { statut: rec.statut },
      apres: { statut: updated.statut },
    });

    return updated;
  }
}