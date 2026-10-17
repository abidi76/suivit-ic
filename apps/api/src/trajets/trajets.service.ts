import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../auth/audit.service';
import { CreateTrajetDto } from './dto/create-trajet.dto';
import { ValidateTrajetDto } from './dto/validate-trajet.dto';
import { UpdateStatusTrajetDto } from './dto/update-status-trajet.dto';
import { ReclamationStatut, Role, TrajetStatut } from '../generated/prisma/client';
import * as crypto from 'crypto';
import  PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TrajetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // Génère une référence unique ex: TRJ-2026-0001
  private async generateReference(): Promise<string> {
    const count = await this.prisma.trajet.count();
    const year = new Date().getFullYear();
    return `TRJ-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  // Création d'un trajet avec ses destinations et réclamations
  async create(dto: CreateTrajetDto, actor: any) {
    const reference = await this.generateReference();

    const trajet = await this.prisma.$transaction(async (prisma) => {
      // 1. Créer le trajet de base
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

      // 2. Lier les réclamations existantes aux destinations
      for (const destDto of dto.destinations) {
        if (destDto.reclamationIds && destDto.reclamationIds.length > 0) {
          const dest = newTrajet.destinations.find(
            d => d.ordre === destDto.ordre && d.etablissementId === destDto.etablissementId
          );
          
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

  // Liste des trajets (avec filtrage selon le rôle)
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

  // Détail d'un trajet
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

  // Validation par le SD-Bâtiment (Assignation véhicule/chauffeur)
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

  // Changement de statut par le SD-TIC (Démarrer, Terminer, Annuler)
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

  // Génération du PDF avec hachage SHA-256
  async generatePdf(id: string, res: any) {
    const trajet = await this.findOne(id);
    if (trajet.statut !== 'ACCEPTE' && trajet.statut !== 'EN_COURS' && trajet.statut !== 'TERMINE') {
      throw new BadRequestException('Le trajet doit être validé pour générer un ordre de mission.');
    }

    // 1. Création du document PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // 2. Configuration du fichier de destination
    const fileName = `Ordre_Mission_${trajet.reference}.pdf`;
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, fileName);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // 3. Contenu du PDF
    doc.fontSize(20).text('RÉPUBLIQUE TUNISIENNE', { align: 'center' });
    doc.fontSize(14).text('Ministère de l\'Éducation', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(`ORDRE DE MISSION N° ${trajet.reference}`, { align: 'center', underline: true });
    doc.moveDown();

    doc.fontSize(12).text(`Date de départ : ${new Date(trajet.dateDepart).toLocaleDateString('fr-FR')}`);
    if (trajet.dateRetour) {
      doc.text(`Date de retour : ${new Date(trajet.dateRetour).toLocaleDateString('fr-FR')}`);
    }
    doc.text(`Motif : ${trajet.motif}`);
    doc.moveDown();

    doc.text('Véhicule :');
    doc.text(`  - Immatriculation : ${trajet.vehicule?.immatricule || 'Non assigné'}`);
    doc.text(`  - Marque/Modèle : ${trajet.vehicule?.marque} ${trajet.vehicule?.modele}`);
    doc.moveDown();

    doc.text('Chauffeur :');
    doc.text(`  - Nom : ${trajet.chauffeur?.nom} ${trajet.chauffeur?.prenom}`);
    doc.text(`  - Téléphone : ${trajet.chauffeur?.telephone}`);
    doc.moveDown();

    doc.text('Techniciens affectés :');
    trajet.techniciens.forEach((t: any) => {
      doc.text(`  - ${t.user.prenom} ${t.user.nom}`);
    });
    doc.moveDown();

    doc.text('Destinations :');
    trajet.destinations.forEach((d: any) => {
      doc.text(`  ${d.ordre}. ${d.etablissement.nomFr} (${d.etablissement.code})`);
    });

    doc.moveDown(4);
    doc.text('Signature du Directeur', { align: 'right' });
    doc.moveDown(2);
    doc.text('_______________________', { align: 'right' });

    doc.end();

    // 4. Attendre la fin de l'écriture, calculer le hash et envoyer le fichier
    return new Promise((resolve, reject) => {
      stream.on('finish', async () => {
        // Hachage SHA-256 (Exigence du cahier des charges)
        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const hexHash = hashSum.digest('hex');

        // Mise à jour du trajet avec l'URL et le Hash
        await this.prisma.trajet.update({
          where: { id: trajet.id },
          data: {
            pdfUrl: `/uploads/${fileName}`,
            pdfSha256: hexHash,
          },
        });

        res.download(filePath, fileName);
        resolve({ success: true, message: 'PDF généré', sha256: hexHash });
      });
      stream.on('error', reject);
    });
  }
}