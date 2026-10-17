import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EquipmentState, InterventionStatut, ReclamationStatut, TrajetStatut } from '../generated/prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobalStats() {
    // On lance toutes les requêtes en parallèle pour que ce soit très rapide
    const [
      totalEquipements,
      equipementsEnPanne,
      equipementsPerdus,
      totalInterventions,
      interventionsEnAttente,
      totalReclamations,
      reclamationsOuvertes,
      totalTrajets,
      trajetsEnCours,
    ] = await Promise.all([
      // --- ÉQUIPEMENTS ---
      this.prisma.equipment.count(),
      this.prisma.equipment.count({ where: { etat: EquipmentState.EN_PANNE } }),
      this.prisma.equipment.count({ where: { etat: EquipmentState.PERDU } }),
      
      // --- INTERVENTIONS ---
      this.prisma.intervention.count(),
      this.prisma.intervention.count({ where: { statut: InterventionStatut.EN_ATTENTE_VALIDATION } }),
      
      // --- RÉCLAMATIONS CONNEXION ---
      this.prisma.reclamationConnexion.count(),
      this.prisma.reclamationConnexion.count({ where: { statut: ReclamationStatut.DECLAREE } }),
      
      // --- TRAJETS ---
      this.prisma.trajet.count(),
      this.prisma.trajet.count({ where: { statut: TrajetStatut.EN_COURS } }),
    ]);

    return {
      equipements: {
        total: totalEquipements,
        enPanne: equipementsEnPanne,
        perdus: equipementsPerdus,
        fonctionnels: totalEquipements - equipementsEnPanne - equipementsPerdus,
      },
      interventions: {
        total: totalInterventions,
        enAttenteValidation: interventionsEnAttente,
      },
      reclamations: {
        total: totalReclamations,
        enAttenteTraitement: reclamationsOuvertes,
      },
      trajets: {
        total: totalTrajets,
        enCours: trajetsEnCours,
      }
    };
  }
}