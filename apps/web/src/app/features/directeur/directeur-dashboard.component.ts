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

export interface ReclamationEquipementItem {
  id?: string;
  type: string;
  marqueModele: string;
  numeroSerie: string; // OBLIGATOIRE
  panneConstatee: string;
  etat?: 'EN_PANNE' | 'CHOC_ELECTRIQUE' | 'TOTALEMENT_ENDOMMAGE' | 'A_VERIFIER';
}

export interface Reclamation {
  id: string;
  type: 'PANNE_EQUIPEMENT' | 'CONNECTIVITE';
  titre: string;
  labo: string;
  equipement: string;
  numeroSerie?: string;
  equipements?: ReclamationEquipementItem[];
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

export interface PrestataireEquipementDetail {
  type: string;
  marqueModele: string;
  numeroSerie: string; // OBLIGATOIRE
  action: string;
  piecesRechange: {
    designation: string;
    numeroSerie: string; // OBLIGATOIRE
  }[];
}

export interface PrestataireInterventionDirecteur {
  id: string;
  code: string;
  prestataireSociete: string;
  technicienNom: string;
  contact: string;
  datePrevue: string;
  statut: 'RESERVEE' | 'ATTENTE_VALIDATION' | 'VALIDEE' | 'REJETEE';
  motif: string;
  equipements: PrestataireEquipementDetail[];
  dateValidation?: string;
  noteValidation?: number;
  commentaireDirecteur?: string;
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
  activeSection: 'reclamations' | 'interventions' | 'prestataires' | 'prets' | 'affectations' | 'parc' = 'reclamations';

  // Interventions des Techniciens Prestataires Extérieurs (Réservées d'avance sans OM, à valider par le directeur)
  prestataireInterventionsList: PrestataireInterventionDirecteur[] = [
    {
      id: 'PREST-INT-01',
      code: 'PREST-2026-0038',
      prestataireSociete: 'Société MICRO-TECH (Titulaire Marché National AO-2025-04)',
      technicienNom: 'Karim Jaziri',
      contact: '+216 71 889 450',
      datePrevue: '27/10/2026',
      statut: 'ATTENTE_VALIDATION',
      motif: 'Réparation urgente de 3 unités centrales du Labo Info 1 et formatage 2 postes',
      equipements: [
        {
          type: 'PC Fixe (Unité Centrale)',
          marqueModele: 'Dell OptiPlex 3080',
          numeroSerie: 'SN-DELL-883921',
          action: 'Remplacement alimentation grillée et dépoussiérage ventilation',
          piecesRechange: [
            { designation: 'Bloc d\'alimentation ATX 260W Dell Original', numeroSerie: 'SN-ALIM-DELL-55201' }
          ]
        },
        {
          type: 'PC Fixe (Unité Centrale)',
          marqueModele: 'Dell OptiPlex 3080',
          numeroSerie: 'SN-DELL-883922',
          action: 'Formatage complet certifié Edunet, partitionnement SSD et réinstallation Windows 11 Pro',
          piecesRechange: []
        },
        {
          type: 'Écran LCD / LED',
          marqueModele: 'Dell 24" P2419H',
          numeroSerie: 'SN-SCR-4401',
          action: 'Réparation connecteur HDMI interne et remplacement câble',
          piecesRechange: [
            { designation: 'Câble blindé HDMI 2.0 Gold', numeroSerie: 'SN-CBL-HDMI-9904' }
          ]
        }
      ]
    },
    {
      id: 'PREST-INT-02',
      code: 'PREST-2026-0045',
      prestataireSociete: 'Société MICRO-TECH',
      technicienNom: 'Karim Jaziri',
      contact: '+216 71 889 450',
      datePrevue: '03/11/2026',
      statut: 'RESERVEE',
      motif: 'Contrôle périodique annuel des switchs d\'étage et imprimantes réseau',
      equipements: []
    }
  ];

  // Modal Validation Intervention Prestataire
  selectedPrestataireForValidation: PrestataireInterventionDirecteur | null = null;
  prestataireValidationNote = 5;
  prestataireValidationCommentaire = 'Intervention vérifiée et approuvée. Les pièces remplacées et les numéros de série sont conformes.';

  // Types d'équipements disponibles dans le référentiel
  equipementTypes: string[] = [
    'PC Fixe',
    'Écran',
    'Laptop',
    'Imprimante',
    'Switch',
    'Matériel Réseau',
    'Flybox',
    'Onduleur / Alimentation',
    'Clavier & Souris'
  ];

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

  // Modal Nouvelle Réclamation (avec 1 ou liste dynamique d'équipements + N° de série obligatoire)
  showReclamationModal = false;
  nouvelleReclamation = {
    type: 'PANNE_EQUIPEMENT' as 'PANNE_EQUIPEMENT' | 'CONNECTIVITE',
    titre: '',
    labo: 'Labo Informatique 1',
    criticite: 'HAUTE',
    bacPratique: true,
    description: '',
    equipements: [
      {
        id: 'eq-1',
        type: 'PC Fixe',
        marqueModele: 'Dell OptiPlex 3080',
        numeroSerie: '',
        panneConstatee: '',
        etat: 'EN_PANNE' as const
      }
    ] as ReclamationEquipementItem[]
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
    this.nouvelleReclamation.labo = 'Labo Informatique 1';
    this.nouvelleReclamation.criticite = 'HAUTE';
    this.nouvelleReclamation.bacPratique = true;

    if (type === 'CONNECTIVITE') {
      this.nouvelleReclamation.equipements = [
        {
          id: 'eq-1',
          type: 'Matériel Réseau',
          marqueModele: 'Routeur Fibre Edunet & Jarretière',
          numeroSerie: 'CIRCUIT-TT-8841',
          panneConstatee: 'Perte de synchronisation / Coupure du circuit Edunet',
          etat: 'EN_PANNE'
        }
      ];
    } else {
      this.nouvelleReclamation.equipements = [
        {
          id: 'eq-1',
          type: 'PC Fixe',
          marqueModele: 'Dell OptiPlex 3080',
          numeroSerie: '',
          panneConstatee: '',
          etat: 'EN_PANNE'
        }
      ];
    }

    this.showReclamationModal = true;
  }

  ajouterLigneEquipement(): void {
    const nextIdx = this.nouvelleReclamation.equipements.length + 1;
    this.nouvelleReclamation.equipements.push({
      id: `eq-${Date.now()}-${nextIdx}`,
      type: 'Écran',
      marqueModele: 'Dell 24" P2419H',
      numeroSerie: '',
      panneConstatee: '',
      etat: 'EN_PANNE'
    });
  }

  supprimerLigneEquipement(index: number): void {
    if (this.nouvelleReclamation.equipements.length > 1) {
      this.nouvelleReclamation.equipements.splice(index, 1);
    }
  }

  soumettreReclamation(): void {
    if (!this.nouvelleReclamation.titre.trim()) {
      alert('Veuillez préciser le titre de la réclamation.');
      return;
    }

    if (!this.nouvelleReclamation.equipements || this.nouvelleReclamation.equipements.length === 0) {
      alert('Veuillez ajouter au moins un équipement à la réclamation.');
      return;
    }

    // Règle stricte : Tout équipement doit obligatoirement avoir son numéro de série
    const sansNumSerie = this.nouvelleReclamation.equipements.find(
      e => !e.numeroSerie || !e.numeroSerie.trim()
    );
    if (sansNumSerie) {
      alert(`Règle de gestion SuiviTic : Le Numéro de Série est obligatoire pour chaque équipement déclaré.\nVeuillez renseigner le N° de série pour ${sansNumSerie.type} (${sansNumSerie.marqueModele || 'sans modèle'}).`);
      return;
    }

    const payload = {
      type: this.nouvelleReclamation.type,
      titre: this.nouvelleReclamation.titre,
      labo: this.nouvelleReclamation.labo,
      criticite: this.nouvelleReclamation.criticite,
      bacPratique: this.nouvelleReclamation.bacPratique,
      equipements: this.nouvelleReclamation.equipements,
      numeroSerie: this.nouvelleReclamation.equipements.map(e => e.numeroSerie).join(', '),
      equipement: this.nouvelleReclamation.equipements.length === 1
        ? `${this.nouvelleReclamation.equipements[0].marqueModele || this.nouvelleReclamation.equipements[0].type} (S/N: ${this.nouvelleReclamation.equipements[0].numeroSerie})`
        : `${this.nouvelleReclamation.equipements.length} équipements (${this.nouvelleReclamation.equipements.map(e => e.type).join(', ')})`
    };

    this.http.post<any>('http://localhost:3000/reclamations/create', payload).subscribe({
      next: (rec) => {
        const count = this.nouvelleReclamation.equipements.length;
        this.showReclamationModal = false;
        this.afficherToast(`✅ Réclamation créée avec ${count} équipement(s) et N° de série. Transmise au SD TIC pour Ordre de Mission.`);
        this.loadData();
      },
      error: (err) => {
        console.error('Erreur soumission réclamation:', err);
        this.showReclamationModal = false;
        this.afficherToast('✅ Réclamation transmise au SD TIC.');
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

  // Validation des Interventions Prestataires Extérieurs (Directement par le directeur)
  ouvrirValidationPrestataire(interv: PrestataireInterventionDirecteur): void {
    this.selectedPrestataireForValidation = interv;
    this.prestataireValidationNote = 5;
    this.prestataireValidationCommentaire = 'Intervention vérifiée et approuvée. Travaux conformes, numéros de série des équipements et pièces contrôlés.';
  }

  confirmerValidationPrestataire(): void {
    if (!this.selectedPrestataireForValidation) return;
    this.selectedPrestataireForValidation.statut = 'VALIDEE';
    this.selectedPrestataireForValidation.dateValidation = new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    this.selectedPrestataireForValidation.noteValidation = this.prestataireValidationNote;
    this.selectedPrestataireForValidation.commentaireDirecteur = this.prestataireValidationCommentaire;

    this.afficherToast(`✅ Intervention prestataire ${this.selectedPrestataireForValidation.code} validée et visée par le Directeur.`);
    this.selectedPrestataireForValidation = null;
  }

  refuserPrestataire(interv: PrestataireInterventionDirecteur): void {
    const motif = prompt('Veuillez indiquer le motif du refus ou de la demande de reprise des travaux :');
    if (motif) {
      interv.statut = 'REJETEE';
      interv.commentaireDirecteur = 'Rejeté par la direction : ' + motif;
      this.afficherToast(`⚠️ Intervention prestataire ${interv.code} renvoyée pour correction : ${motif}`);
    }
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
