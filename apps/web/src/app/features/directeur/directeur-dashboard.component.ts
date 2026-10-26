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

export interface LaboAffectation {
  id: string;
  labo: string;
  profTitulaire: string;
  profBacPratique: string;
  tachesBac: string;
  etatPreparationBac: 'NON_COMMENCE' | 'ENGAGEMENT_SOUMIS' | 'VALIDE_CONFORME';
  bacValideParDirecteur: boolean;
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
  activeSection: 'reclamations' | 'interventions' | 'prets' | 'affectations' | 'parc' = 'reclamations';

  // Affectation des Profs aux Labos (Mode Normal & Mode Bac Pratique)
  affectationsList: LaboAffectation[] = [
    {
      id: 'AFF-01',
      labo: 'Laboratoire Informatique 1',
      profTitulaire: 'Sami Mansour',
      profBacPratique: 'Sami Mansour & Amel Ben Ali',
      tachesBac: 'Formatage certifié, installation Python 3 & MySQL, vérification 24 postes',
      etatPreparationBac: 'ENGAGEMENT_SOUMIS',
      bacValideParDirecteur: false
    },
    {
      id: 'AFF-02',
      labo: 'Laboratoire Informatique 2 (Salle Examen)',
      profTitulaire: 'Monia Khelifi',
      profBacPratique: 'Monia Khelifi',
      tachesBac: 'Installation master image, isolation réseau Internet, test imprimante locale',
      etatPreparationBac: 'VALIDE_CONFORME',
      bacValideParDirecteur: true
    },
    {
      id: 'AFF-03',
      labo: 'Salle Réseau & Multimédia',
      profTitulaire: 'Hichem Saidi',
      profBacPratique: 'Hichem Saidi',
      tachesBac: 'Câblage secours et configuration Flybox 4G pour le centre de tirage',
      etatPreparationBac: 'NON_COMMENCE',
      bacValideParDirecteur: false
    }
  ];

  // Modal Nouvelle Réclamation (avec N° de série obligatoire)
  showReclamationModal = false;
  nouvelleReclamation = {
    type: 'PANNE_EQUIPEMENT',
    titre: '',
    labo: 'Labo Informatique 1',
    equipement: '',
    numeroSerie: '',
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

  // Modal Modification Affectation Prof
  selectedAffectation: LaboAffectation | null = null;
  editProfTitulaire = '';
  editProfBac = '';
  editTachesBac = '';

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
    this.nouvelleReclamation.numeroSerie = type === 'CONNECTIVITE' ? 'CIRCUIT-TT-8841' : '';
    this.showReclamationModal = true;
  }

  soumettreReclamation(): void {
    if (!this.nouvelleReclamation.titre.trim()) return;
    if (!this.nouvelleReclamation.numeroSerie.trim()) {
      alert('Le Numéro de Série du ou des équipements est obligatoire pour toute réclamation.');
      return;
    }

    this.http.post<any>('http://localhost:3000/reclamations/create', this.nouvelleReclamation).subscribe({
      next: (rec) => {
        this.showReclamationModal = false;
        this.nouvelleReclamation = {
          type: 'PANNE_EQUIPEMENT',
          titre: '',
          labo: 'Labo Informatique 1',
          equipement: '',
          numeroSerie: '',
          criticite: 'HAUTE',
          bacPratique: true,
          description: ''
        };
        this.afficherToast('✅ Réclamation transmise au SD TIC avec N° de série (affectation d\'Ordre de Mission en cours).');
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
        this.afficherToast(accept ? '✅ Accord donné pour le prêt au lycée partenaire.' : 'ℹ️ Sollicitation de prêt déclinée.');
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

  // Affectation des Profs par le Directeur
  ouvrirModificationAffectation(aff: LaboAffectation): void {
    this.selectedAffectation = aff;
    this.editProfTitulaire = aff.profTitulaire;
    this.editProfBac = aff.profBacPratique;
    this.editTachesBac = aff.tachesBac;
  }

  enregistrerAffectation(): void {
    if (!this.selectedAffectation) return;
    this.selectedAffectation.profTitulaire = this.editProfTitulaire;
    this.selectedAffectation.profBacPratique = this.editProfBac;
    this.selectedAffectation.tachesBac = this.editTachesBac;
    this.selectedAffectation = null;
    this.afficherToast('✅ Affectation des professeurs au laboratoire mise à jour avec succès.');
  }

  validerConformiteLaboBac(aff: LaboAffectation): void {
    aff.bacValideParDirecteur = true;
    aff.etatPreparationBac = 'VALIDE_CONFORME';
    this.afficherToast(`✅ Les travaux de préparation de ${aff.labo} ont été validés conformes par le Directeur pour le Bac Pratique.`);
  }

  afficherToast(msg: string): void {
    this.successToast = msg;
    setTimeout(() => {
      this.successToast = '';
    }, 4500);
  }
}
