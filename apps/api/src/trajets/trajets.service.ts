import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../auth/audit.service';
import { CreateTrajetDto } from './dto/create-trajet.dto';
import { ValidateTrajetDto } from './dto/validate-trajet.dto';
import { UpdateStatusTrajetDto } from './dto/update-status-trajet.dto';
import { ReclamationStatut, Role, TrajetStatut } from '../generated/prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class TrajetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private async generateReference(): Promise<string> {
    const count = await this.prisma.trajet.count();
    const year = new Date().getFullYear();
    return `TRJ-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: CreateTrajetDto, actor: any) {
    const reference = await this.generateReference();

    // Utilisation d'une transaction pour tout créer d'un coup
    const trajet = await this.prisma.$transaction(async (prisma) => {
      // 1. Créer le trajet
      const newTrajet = await prisma.trajet.create({
        data: {
          reference,
          motif: dto.motif,
          description: dto.description,
          dateDepart: new Date(dto.dateDepart),
          dateRetour: dto.dateRetour ? new Date(dto.dateRetour) : null,
          dureeEstimee: dto.dureeEstimee,
          demandeurId: actor.userId,
          statut: TrajetStatut.DEMANDE,
          techniciens: {
            create: dto.technicienIds.map(id => ({ userId: id })),
          },
          destinations: {
            create: dto.destinations.map(d => ({
              etablissementId: d.etablissementId,
              ordre: d.ordre,
            })),
          },
        },
        include: { destinations: true },
      });

      // 2. Lier les réclamations aux destinations
      for (const destDto of dto.destinations) {
        if (destDto.reclamationIds && destDto.reclamationIds.length > 0) {
          // Trouver la destination qui vient d'être créée pour récupérer son ID
          const dest = newTrajet.destinations.find(d => d.ordre === destDto.ordre && d.etablissementId === destDto.etablissementId);
          
          if (dest) {
            await prisma.reclamationConnexion.updateMany({
              where: { id: { in: destDto.reclamationIds } },
              data: {
                trajetId: newTrajet.id,
                destinationId: dest.id,
                statut: ReclamationStatut.RATTACHEE_TRAJET,
              },
            });
          }
        }
      }

      return newTrajet;
    });

    await this.audit.log({
      userId: actor.userId,
      action: 'CREATE',
      entite: 'Trajet',
      entiteId: trajet.id,
      apres: trajet,
    });

    return trajet;
  }

  async findAll(actor: any) {
    const where: any = {};
    
    // Un technicien ne voit que les trajets où il est assigné
    if (actor.role === Role.TECHNICIEN_INTERNE || actor.role === Role.TECHNICIEN_PRESTATAIRE) {
      where.techniciens = { some: { userId: actor.userId } };
    }

    return this.prisma.trajet.findMany({
      where,
      include: {
        demandeur: { select: { nom: true, prenom: true } },
        vehicule: true,
        chauffeur: true,
        destinations: { include: { etablissement: true } },
        techniciens: { include: { user: { select: { nom: true, prenom: true } } } },
      },
      orderBy: { dateDepart: 'desc' },
    });
  }

  async findOne(id: string) {
    const trajet = await this.prisma.trajet.findUnique({
      where: { id },
      include: {
        demandeur: true,
        valideurBat: true,
        vehicule: true,
        chauffeur: true,
        destinations: { include: { etablissement: true, reclamations: true } },
        techniciens: { include: { user: true } },
      },
    });
    if (!trajet) throw new NotFoundException('Trajet introuvable.');
    return trajet;
  }

  // Étape SD-Bâtiment : Valider le véhicule et le chauffeur
  async validate(id: string, dto: ValidateTrajetDto, actor: any) {
    const trajet = await this.findOne(id);
    if (trajet.statut !== TrajetStatut.DEMANDE) {
      throw new BadRequestException('Ce trajet a déjà été traité.');
    }

    if (dto.statut === TrajetStatut.REFUSE && !dto.motifRefus) {
      throw new BadRequestException('Un motif de refus est obligatoire.');
    }

    const updated = await this.prisma.trajet.update({
      where: { id },
      data: {
        statut: dto.statut,
        vehiculeId: dto.vehiculeId,
        chauffeurId: dto.chauffeurId,
        motifRefus: dto.motifRefus,
        valideurBatId: actor.userId,
        valideAt: new Date(),
      },
    });

    await this.audit.log({
      userId: actor.userId,
      action: 'VALIDATE',
      entite: 'Trajet',
      entiteId: id,
      avant: { statut: trajet.statut },
      apres: { statut: updated.statut },
    });

    return updated;
  }

  // Étape SD-TIC : Changer le statut (Démarrer, Terminer, Annuler)
  async updateStatus(id: string, dto: UpdateStatusTrajetDto, actor: any) {
    const trajet = await this.findOne(id);

    const updated = await this.prisma.trajet.update({
      where: { id },
      data: { statut: dto.statut },
    });

    await this.audit.log({
      userId: actor.userId,
      action: 'UPDATE_STATUS',
      entite: 'Trajet',
      entiteId: id,
      avant: { statut: trajet.statut },
      apres: { statut: updated.statut },
    });

    return updated;
  }

  // Génération d'un faux PDF pour l'exemple (à remplacer par pdfkit ou pdfmake)
  async generatePdf(id: string) {
    const trajet = await this.findOne(id);
    if (trajet.statut !== TrajetStatut.ACCEPTE && trajet.statut !== TrajetStatut.EN_COURS && trajet.statut !== TrajetStatut.TERMINE) {
      throw new BadRequestException('Le trajet doit être validé (accepté) pour générer un ordre de mission.');
    }

    // 1. Simulation de la génération du fichier (Mettez ici votre code pdfkit)
    const pdfContent = `ORDRE DE MISSION - ${trajet.reference}\nVéhicule: ${trajet.vehicule?.immatricule}\nChauffeur: ${trajet.chauffeur?.nom}`;
    
    // 2. Hachage SHA-256 pour l'intégrité (comme exigé dans votre doc)
    const sha256 = crypto.createHash('sha256').update(pdfContent).digest('hex');
    
    // 3. Simulation d'un chemin de stockage
    const pdfUrl = `/uploads/ordres-mission/${trajet.reference}.pdf`;

    const updated = await this.prisma.trajet.update({
      where: { id },
      data: { pdfUrl, pdfSha256: sha256 },
    });

    return { message: 'PDF généré avec succès', pdfUrl: updated.pdfUrl, sha256: updated.pdfSha256 };
  }
}