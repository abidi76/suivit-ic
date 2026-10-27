import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserAccount } from '../../core/services/auth.service';

export interface PieceRechangeItem {
  id: string;
  designation: string;
  numeroSerie: string; // Obligatoire
  prixUnitaireRef?: string;
}

export interface PrestataireEquipementServi {
  id: string;
  type: string;
  marqueModele: string;
  numeroSerie: string; // Obligatoire
  actionEffectuee: 'FORMATAGE' | 'REPARATION' | 'NETTOYAGE' | 'REMPLACEMENT_PIECE' | 'PARAMETRAGE';
  actionDetails: string;
  piecesRechange: PieceRechangeItem[];
}

export interface InterventionPrestataire {
  id: string;
  codeIntervention: string;
  etablissementId: string;
  etablissementNom: string;
  delegation: string;
  directeurNom: string;
  contactDirecteur: string;
  dateReservationPrevue: string;
  creneauHoraire: string;
  motifIntervention: string;
  // RÈGLE STRICTE DU SYSTÈME SUIVITIC :
  dispenseOrdreDeMission: true;
  dispenseVehiculeParc: true;
  // Statut du flux
  statut: 'RESERVEE_DIRECTEUR' | 'EN_COURS_SUR_SITE' | 'ATTENTE_VALIDATION_DIRECTEUR' | 'VALIDEE_PAR_DIRECTEUR' | 'REJETEE_POUR_CORRECTION';
  statutLabel: string;
  // Données de l'intervention terminée
  dateExecution?: string;
  equipementsServis: PrestataireEquipementServi[];
  observationsTechnicien?: string;
  // Validation par le directeur
  visaDirecteurDate?: string;
  signatureElectroniqueDirecteur?: string;
  commentaireDirecteur?: string;
  noteDirecteur?: number;
}

@Component({
  selector: 'app-technicien-prestataire-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './technicien-prestataire-dashboard.component.html',
  styleUrls: ['./technicien-prestataire-dashboard.component.scss']
})
export class TechnicienPrestataireDashboardComponent implements OnInit {
  currentUser: UserAccount | null = null;
  activeTab: 'reservations' | 'nouveau-rapport' | 'historique-valide' = 'reservations';

  // Référentiel des établissements de la région pour réservation directe
  etablissementsPartenaires = [
    { id: 'ETAB-101', nom: 'Lycée Ibn Abi Dhiaf - Manouba', delegation: 'Manouba', directeur: 'M. Moncef Ben Salem', telephone: '+216 71 600 120' },
    { id: 'ETAB-102', nom: 'Lycée Asad Ibn Al Fourat - Oued Ellil', delegation: 'Oued Ellil', directeur: 'M. Tarek Hamdi', telephone: '+216 71 612 340' },
    { id: 'ETAB-103', nom: 'Collège Pilote Manouba', delegation: 'Manouba', directeur: 'Mme Sonia Mejri', telephone: '+216 71 601 880' },
    { id: 'ETAB-104', nom: 'Collège Technique & Professionnel Oued Ellil', delegation: 'Oued Ellil', directeur: 'M. Ridha Mabrouk', telephone: '+216 71 615 500' },
    { id: 'ETAB-105', nom: 'Lycée Borj El Amri', delegation: 'Borj El Amri', directeur: 'M. Belhassen Riahi', telephone: '+216 71 650 200' },
    { id: 'ETAB-106', nom: 'École Primaire Habib Bourguiba - Manouba', delegation: 'Manouba', directeur: 'Mme Latifa Riahi', telephone: '+216 71 604 110' }
  ];

  // Types d'équipements pour saisie
  typesEquipements = [
    'PC Fixe (Unité Centrale)',
    'Écran LCD / LED',
    'Laptop / Ordinateur Portable',
    'Imprimante Laser / Jet d\'encre',
    'Switch Réseau / Routeur',
    'Onduleur / Alimentation Secourue',
    'Vidéoprojecteur Interactif',
    'Scanner / Périphérique'
  ];

  // Interventions du prestataire
  interventions: InterventionPrestataire[] = [
    {
      id: 'INT-PREST-01',
      codeIntervention: 'PREST-2026-0038',
      etablissementId: 'ETAB-101',
      etablissementNom: 'Lycée Ibn Abi Dhiaf - Manouba',
      delegation: 'Manouba',
      directeurNom: 'M. Moncef Ben Salem',
      contactDirecteur: '+216 71 600 120',
      dateReservationPrevue: 'Aujourd\'hui',
      creneauHoraire: '09h30 - 13h00',
      motifIntervention: 'Réparation urgente de 3 unités centrales du Labo Info 1 et formatage 2 postes',
      dispenseOrdreDeMission: true,
      dispenseVehiculeParc: true,
      statut: 'ATTENTE_VALIDATION_DIRECTEUR',
      statutLabel: 'En attente de validation du Directeur d\'Établissement',
      dateExecution: '27/10/2026',
      observationsTechnicien: 'Intervention terminée sur site. 3 blocs d\'alimentation remplacés et formatage exécuté avec succès.',
      equipementsServis: [
        {
          id: 'EQ-SRV-01',
          type: 'PC Fixe (Unité Centrale)',
          marqueModele: 'Dell OptiPlex 3080',
          numeroSerie: 'SN-DELL-883921',
          actionEffectuee: 'REMPLACEMENT_PIECE',
          actionDetails: 'Remplacement alimentation grillée et dépoussiérage des ventilateurs CPU.',
          piecesRechange: [
            { id: 'P-1', designation: 'Bloc d\'alimentation ATX 260W Dell Original', numeroSerie: 'SN-ALIM-DELL-55201', prixUnitaireRef: 'Garantie Marché AO-2025' }
          ]
        },
        {
          id: 'EQ-SRV-02',
          type: 'PC Fixe (Unité Centrale)',
          marqueModele: 'Dell OptiPlex 3080',
          numeroSerie: 'SN-DELL-883922',
          actionEffectuee: 'FORMATAGE',
          actionDetails: 'Formatage complet certifié Edunet, partitionnement SSD et réinstallation Windows 11 Pro + Python.',
          piecesRechange: []
        },
        {
          id: 'EQ-SRV-03',
          type: 'Écran LCD / LED',
          marqueModele: 'Dell 24" P2419H',
          numeroSerie: 'SN-SCR-4401',
          actionEffectuee: 'REPARATION',
          actionDetails: 'Réparation connecteur HDMI interne et remplacement câble d\'alimentation.',
          piecesRechange: [
            { id: 'P-2', designation: 'Câble blindé HDMI 2.0 Gold', numeroSerie: 'SN-CBL-HDMI-9904' }
          ]
        }
      ]
    },
    {
      id: 'INT-PREST-02',
      codeIntervention: 'PREST-2026-0041',
      etablissementId: 'ETAB-102',
      etablissementNom: 'Lycée Asad Ibn Al Fourat - Oued Ellil',
      delegation: 'Oued Ellil',
      directeurNom: 'M. Tarek Hamdi',
      contactDirecteur: '+216 71 612 340',
      dateReservationPrevue: 'Demain 28/10/2026',
      creneauHoraire: '08h30 - 12h00',
      motifIntervention: 'Révision semestrielle et remplacement disques durs défaillants salle multimédia',
      dispenseOrdreDeMission: true,
      dispenseVehiculeParc: true,
      statut: 'RESERVEE_DIRECTEUR',
      statutLabel: 'Réservée auprès du Directeur (Sans OM / Véhicule société)',
      equipementsServis: []
    },
    {
      id: 'INT-PREST-03',
      codeIntervention: 'PREST-2026-0029',
      etablissementId: 'ETAB-103',
      etablissementNom: 'Collège Pilote Manouba',
      delegation: 'Manouba',
      directeurNom: 'Mme Sonia Mejri',
      contactDirecteur: '+216 71 601 880',
      dateReservationPrevue: '20/10/2026',
      creneauHoraire: '14h00 - 17h30',
      motifIntervention: 'Réparation imprimante laser de direction et formatage 4 postes administratifs',
      dispenseOrdreDeMission: true,
      dispenseVehiculeParc: true,
      statut: 'VALIDEE_PAR_DIRECTEUR',
      statutLabel: 'Validée & Signée par la Directrice d\'Établissement',
      dateExecution: '20/10/2026',
      visaDirecteurDate: '20/10/2026 17:45',
      signatureElectroniqueDirecteur: 'Visa Certifié Mme Sonia Mejri (Collège Pilote)',
      commentaireDirecteur: 'Travaux exécutés avec rigueur. Postes rétablis et matériel propre.',
      noteDirecteur: 5,
      equipementsServis: [
        {
          id: 'EQ-01',
          type: 'Imprimante Laser / Jet d\'encre',
          marqueModele: 'HP LaserJet Pro M404n',
          numeroSerie: 'SN-HP-M404-9910',
          actionEffectuee: 'REMPLACEMENT_PIECE',
          actionDetails: 'Remplacement rouleau d\'entraînement papier et kit tambour.',
          piecesRechange: [
            { id: 'P-11', designation: 'Kit Rouleau & Séparateur HP Original', numeroSerie: 'SN-KIT-HP-8831' }
          ]
        }
      ]
    }
  ];

  // Modal Réservation directe avec le directeur
  showReservationModal = false;
  nouvelleReservation = {
    etablissementId: 'ETAB-101',
    dateReservation: '',
    creneauHoraire: '09h00 - 12h30',
    motifIntervention: ''
  };

  // Modal / Saisie Rapport d'intervention
  selectedInterventionForReport: InterventionPrestataire | null = null;
  formRapport = {
    dateExecution: new Date().toLocaleDateString('fr-FR'),
    observationsTechnicien: '',
    equipements: [] as PrestataireEquipementServi[]
  };

  toastMessage = '';

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    // Par défaut date du jour pour nouvelle réservation
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.nouvelleReservation.dateReservation = tomorrow.toISOString().split('T')[0];
  }

  // Ouvrir modal de réservation directe
  ouvrirModalReservation(): void {
    this.nouvelleReservation.motifIntervention = '';
    this.showReservationModal = true;
  }

  confirmerReservationDirecte(): void {
    if (!this.nouvelleReservation.motifIntervention.trim()) {
      alert('Veuillez indiquer le motif ou la nature de l\'intervention convenue avec le directeur.');
      return;
    }
    const etab = this.etablissementsPartenaires.find(e => e.id === this.nouvelleReservation.etablissementId);
    if (!etab) return;

    const newIntervention: InterventionPrestataire = {
      id: 'INT-PREST-' + Date.now(),
      codeIntervention: 'PREST-2026-00' + Math.floor(50 + Math.random() * 40),
      etablissementId: etab.id,
      etablissementNom: etab.nom,
      delegation: etab.delegation,
      directeurNom: etab.directeur,
      contactDirecteur: etab.telephone,
      dateReservationPrevue: this.nouvelleReservation.dateReservation,
      creneauHoraire: this.nouvelleReservation.creneauHoraire,
      motifIntervention: this.nouvelleReservation.motifIntervention,
      dispenseOrdreDeMission: true,
      dispenseVehiculeParc: true,
      statut: 'RESERVEE_DIRECTEUR',
      statutLabel: 'Réservée avec le Directeur (Sans OM / Moyen propre prestataire)',
      equipementsServis: []
    };

    this.interventions.unshift(newIntervention);
    this.showReservationModal = false;
    this.afficherToast(`✅ Intervention réservée avec succès auprès de ${etab.directeur} (${etab.nom}) sans nécessité d'OM CRE !`);
  }

  // Ouvrir la saisie du rapport d'intervention
  commencerRapport(item: InterventionPrestataire): void {
    this.selectedInterventionForReport = item;
    this.activeTab = 'nouveau-rapport';
    this.formRapport.observationsTechnicien = item.observationsTechnicien || '';
    this.formRapport.dateExecution = new Date().toLocaleDateString('fr-FR');
    
    if (item.equipementsServis && item.equipementsServis.length > 0) {
      this.formRapport.equipements = JSON.parse(JSON.stringify(item.equipementsServis));
    } else {
      // Pré-remplir avec au moins 1 équipement
      this.formRapport.equipements = [
        {
          id: 'eq-' + Date.now(),
          type: 'PC Fixe (Unité Centrale)',
          marqueModele: 'Dell OptiPlex 3080',
          numeroSerie: '',
          actionEffectuee: 'FORMATAGE',
          actionDetails: 'Formatage complet et réinstallation master ISO',
          piecesRechange: []
        }
      ];
    }
  }

  ajouterEquipementRapport(): void {
    this.formRapport.equipements.push({
      id: 'eq-' + Date.now() + '-' + (this.formRapport.equipements.length + 1),
      type: 'PC Fixe (Unité Centrale)',
      marqueModele: '',
      numeroSerie: '',
      actionEffectuee: 'REPARATION',
      actionDetails: '',
      piecesRechange: []
    });
  }

  supprimerEquipementRapport(idx: number): void {
    if (this.formRapport.equipements.length > 1) {
      this.formRapport.equipements.splice(idx, 1);
    }
  }

  ajouterPieceRechange(eqIdx: number): void {
    this.formRapport.equipements[eqIdx].piecesRechange.push({
      id: 'p-' + Date.now() + '-' + (this.formRapport.equipements[eqIdx].piecesRechange.length + 1),
      designation: '',
      numeroSerie: '',
      prixUnitaireRef: 'Inclus Marché AO-2025'
    });
  }

  supprimerPieceRechange(eqIdx: number, pIdx: number): void {
    this.formRapport.equipements[eqIdx].piecesRechange.splice(pIdx, 1);
  }

  soumettreRapportAuDirecteur(): void {
    if (!this.selectedInterventionForReport) return;

    if (this.formRapport.equipements.length === 0) {
      alert('Veuillez ajouter au moins un équipement pris en charge.');
      return;
    }

    // Validation stricte : Tout équipement doit avoir son Numéro de Série
    for (let i = 0; i < this.formRapport.equipements.length; i++) {
      const eq = this.formRapport.equipements[i];
      if (!eq.numeroSerie.trim()) {
        alert(`Règle stricte SuiviTic : Le Numéro de Série de l'équipement #${i + 1} (${eq.type}) est obligatoire.`);
        return;
      }
      if (!eq.marqueModele.trim()) {
        alert(`Veuillez renseigner la marque et le modèle pour l'équipement #${i + 1}.`);
        return;
      }
      // Si des pièces sont posées, leur N° de série est également obligatoire !
      for (let j = 0; j < eq.piecesRechange.length; j++) {
        const piece = eq.piecesRechange[j];
        if (!piece.designation.trim() || !piece.numeroSerie.trim()) {
          alert(`Règle de traçabilité : Toute pièce de rechange posée sur l'équipement (S/N: ${eq.numeroSerie}) doit obligatoirement avoir sa désignation ET son N° de série certifié.`);
          return;
        }
      }
    }

    // Enregistrement
    this.selectedInterventionForReport.equipementsServis = JSON.parse(JSON.stringify(this.formRapport.equipements));
    this.selectedInterventionForReport.observationsTechnicien = this.formRapport.observationsTechnicien;
    this.selectedInterventionForReport.dateExecution = this.formRapport.dateExecution;
    this.selectedInterventionForReport.statut = 'ATTENTE_VALIDATION_DIRECTEUR';
    this.selectedInterventionForReport.statutLabel = 'En attente de validation du Directeur d\'Établissement';

    this.activeTab = 'reservations';
    this.selectedInterventionForReport = null;
    this.afficherToast('✅ Fiche d\'intervention transmise avec succès au Directeur d\'Établissement pour visa et validation !');
  }

  afficherToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = '';
    }, 4500);
  }
}
