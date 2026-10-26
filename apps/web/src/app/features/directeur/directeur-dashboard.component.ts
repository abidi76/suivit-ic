import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface CircuitInfo {
  id: string;
  type: string;
  operateur: string;
  debit: string;
  statut: string;
  expiration: string;
}

export interface InterventionAValider {
  id: string;
  technicien: string;
  type: string;
  equipementId: string;
  equipementNom: string;
  dateIntervention: string;
  rapportDetaille: string;
  piecesPosees: string;
  statut: string;
}

export interface DemandePret {
  id: string;
  direction: 'RECU' | 'ENVOYE';
  demandeurNom?: string;
  cibleNom?: string;
  typeMateriel: string;
  motif: string;
  periode: string;
  statut: string;
}

export interface Reclamation {
  id: string;
  type: 'PANNE_EQUIPEMENT' | 'CONNECTIVITE';
  titre: string;
  labo: string;
  equipement: string;
  criticite: string;
  bacPratique: boolean;
  dateDeclaration: string;
  statut: string;
  statutTexte: string;
  sdTicDetails?: {
    omNumero: string;
    vehicule: string;
    chauffeur: string;
    technicien: string;
    dateMission: string;
  } | null;
  rapportTechnicien?: string | null;
}

@Component({
  selector: 'app-directeur-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './directeur-dashboard.component.html',
  styleUrls: ['./directeur-dashboard.component.scss']
})
export class DirecteurDashboardComponent implements OnInit {
  data: any = null;
  isLoading = true;
  activeSection: 'reclamations' | 'interventions' | 'prets' | 'parc' = 'reclamations';

  // Modal Nouvelle Réclamation
  showReclamationModal = false;
  nouvelleReclamation = {
    type: 'PANNE_EQUIPEMENT',
    titre: '',
    labo: 'Labo Informatique 1',
    equipement: '',
    criticite: 'HAUTE',
    bacPratique: true,
    description: ''
  };

  // Modal Validation Intervention
  selectedIntervention: InterventionAValider | null = null;
  validationNote = 5;
  validationCommentaire = '';

  // Modal Nouvelle Demande Prêt / Flybox
  showPretModal = false;
  nouveauPret = {
    typeMateriel: 'Flybox 4G Secours (Préparation Bac Pratique)',
    motif: 'Secours connexion pour la salle de tirage du Bac Pratique',
    periode: 'Mai 2026',
    cibleNom: 'CRE Manouba'
  };

  successToast = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.http.get<any>('http://localhost:3000/directeur/data').subscribe({
      next: (res) => {
        this.data = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement données directeur:', err);
        this.isLoading = false;
      }
    });
  }

  openReclamationModal(type: 'PANNE_EQUIPEMENT' | 'CONNECTIVITE'): void {
    this.nouvelleReclamation.type = type;
    this.nouvelleReclamation.titre = type === 'CONNECTIVITE' ? 'Coupure connexion Internet / Intranet' : '';
    this.nouvelleReclamation.equipement = type === 'CONNECTIVITE' ? 'Circuit Fibre Edunet ou Routeur principal' : '';
    this.showReclamationModal = true;
  }

  soumettreReclamation(): void {
    if (!this.nouvelleReclamation.titre.trim()) return;

    this.http.post<any>('http://localhost:3000/reclamations/create', this.nouvelleReclamation).subscribe({
      next: (rec) => {
        this.showReclamationModal = false;
        this.nouvelleReclamation = {
          type: 'PANNE_EQUIPEMENT',
          titre: '',
          labo: 'Labo Informatique 1',
          equipement: '',
          criticite: 'HAUTE',
          bacPratique: true,
          description: ''
        };
        this.afficherToast('✅ Réclamation envoyée à la Sous-Direction TIC (en attente d\'Ordre de Mission).');
        this.loadData();
      }
    });
  }

  ouvrirValidationIntervention(item: InterventionAValider): void {
    this.selectedIntervention = item;
    this.validationNote = 5;
    this.validationCommentaire = 'Travaux vérifiés et conformes aux besoins du laboratoire.';
  }

  confirmerValidationIntervention(): void {
    if (!this.selectedIntervention) return;
    this.http.post('http://localhost:3000/interventions/valider', {
      interventionId: this.selectedIntervention.id,
      note: this.validationNote,
      commentaire: this.validationCommentaire
    }).subscribe({
      next: () => {
        this.afficherToast(`✅ Intervention ${this.selectedIntervention?.id} validée avec succès.`);
        this.selectedIntervention = null;
        this.loadData();
      }
    });
  }

  repondrePret(pretId: string, accept: boolean): void {
    this.http.post('http://localhost:3000/prets/repondre', { pretId, accept }).subscribe({
      next: () => {
        this.afficherToast(accept ? '✅ Demande d\'emprunt acceptée pour le lycée partenaire.' : 'ℹ️ Demande de prêt déclinée.');
        this.loadData();
      }
    });
  }

  soumettreDemandePret(): void {
    this.http.post('http://localhost:3000/prets/demander', this.nouveauPret).subscribe({
      next: () => {
        this.showPretModal = false;
        this.afficherToast('✅ Demande de prêt / Flybox transmise au Superviseur SD TIC.');
        this.loadData();
      }
    });
  }

  afficherToast(msg: string): void {
    this.successToast = msg;
    setTimeout(() => {
      this.successToast = '';
    }, 4500);
  }
}
