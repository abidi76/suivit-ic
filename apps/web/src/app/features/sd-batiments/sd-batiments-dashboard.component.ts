import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserAccount } from '../../core/services/auth.service';

export interface VehiculeParc {
  id: string;
  immatriculation: string;
  marqueModele: string;
  type: 'FOURGONNETTE' | 'UTILITAIRE' | 'BERLINE';
  statut: 'DISPONIBLE' | 'EN_MISSION' | 'EN_REVISION' | 'IMMOBILISE';
  kilometrage: number;
  chauffeurAttitre?: string;
  prochaineVisiteTechnique: string;
}

export interface ChauffeurCre {
  id: string;
  nomPrenom: string;
  matricule: string;
  telephone: string;
  statut: 'DISPONIBLE' | 'EN_MISSION' | 'CONGE';
  missionEnCours?: string;
}

export interface DemandeVoitureMission {
  id: string;
  omNumero: string;
  dateTransmissionSdTic: string;
  technicienDemandeur: string;
  etablissementDestination: string;
  motifMission: string;
  dateDemandee: string;
  equipementsConcernes: string;
  statut: 'EN_ATTENTE_SD_BATIMENTS' | 'VALIDE_AVEC_VEHICULE' | 'AJOURNE_REPORTE';
  statutLabel: string;
  vehiculeAffecte?: string;
  chauffeurAffecte?: string;
  dateAjournee?: string;
  motifAjournement?: string;
}

@Component({
  selector: 'app-sd-batiments-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sd-batiments-dashboard.component.html',
  styleUrls: ['./sd-batiments-dashboard.component.scss']
})
export class SdBatimentsDashboardComponent implements OnInit {
  currentUser: UserAccount | null = null;
  activeTab: 'demandes-voitures' | 'flotte-parc' | 'chauffeurs' = 'demandes-voitures';

  // Flotte Automobile de la CRE Manouba
  vehiculesList: VehiculeParc[] = [
    {
      id: 'VEH-01',
      immatriculation: '204 TU 1150',
      marqueModele: 'Peugeot Partner HDi',
      type: 'FOURGONNETTE',
      statut: 'DISPONIBLE',
      kilometrage: 124500,
      chauffeurAttitre: 'Amor Trabelsi',
      prochaineVisiteTechnique: '15/12/2026'
    },
    {
      id: 'VEH-02',
      immatriculation: '185 TU 4421',
      marqueModele: 'Renault Kangoo Express',
      type: 'UTILITAIRE',
      statut: 'DISPONIBLE',
      kilometrage: 168200,
      chauffeurAttitre: 'Hédi Baccouche',
      prochaineVisiteTechnique: '02/11/2026'
    },
    {
      id: 'VEH-03',
      immatriculation: '220 TU 9832',
      marqueModele: 'Dacia Dokker Van',
      type: 'UTILITAIRE',
      statut: 'EN_MISSION',
      kilometrage: 89400,
      chauffeurAttitre: 'Ridha Bouzid',
      prochaineVisiteTechnique: '20/01/2027'
    },
    {
      id: 'VEH-04',
      immatriculation: '190 TU 3102',
      marqueModele: 'Citroën Berlingo',
      type: 'FOURGONNETTE',
      statut: 'EN_REVISION',
      kilometrage: 210000,
      chauffeurAttitre: 'Kamel Dridi',
      prochaineVisiteTechnique: '30/10/2026'
    }
  ];

  // Chauffeurs de la CRE
  chauffeursList: ChauffeurCre[] = [
    { id: 'CHF-01', nomPrenom: 'Amor Trabelsi', matricule: 'CHF-101', telephone: '+216 98 441 202', statut: 'DISPONIBLE' },
    { id: 'CHF-02', nomPrenom: 'Hédi Baccouche (Chauffeur Logistique)', matricule: 'CHF-102', telephone: '+216 97 552 108', statut: 'DISPONIBLE' },
    { id: 'CHF-03', nomPrenom: 'Ridha Bouzid', matricule: 'CHF-103', telephone: '+216 94 330 914', statut: 'EN_MISSION', missionEnCours: 'Lycée Ibn Abi Dhiaf' },
    { id: 'CHF-04', nomPrenom: 'Kamel Dridi', matricule: 'CHF-104', telephone: '+216 92 119 443', statut: 'CONGE' }
  ];

  // Demandes de voitures transmises par le SD-TIC pour les techniciens internes
  demandesMissions: DemandeVoitureMission[] = [
    {
      id: 'DEM-01',
      omNumero: 'OM-2026-0192',
      dateTransmissionSdTic: 'Aujourd\'hui 08:15',
      technicienDemandeur: 'Sami Khelifi (Technicien Interne CRE)',
      etablissementDestination: 'Lycée Ibn Abi Dhiaf (Manouba)',
      motifMission: 'Remplacement urgent bloc d\'alimentation sur 5 écrans Dell et diagnostic baie réseau',
      dateDemandee: 'Demain 28/10/2026 à 08h30',
      equipementsConcernes: 'Lot 5 Écrans Dell 24" P2419H (S/N: SN-SCR-4401 à 4405)',
      statut: 'EN_ATTENTE_SD_BATIMENTS',
      statutLabel: 'En attente d\'affectation Véhicule & Chauffeur'
    },
    {
      id: 'DEM-02',
      omNumero: 'OM-2026-0188',
      dateTransmissionSdTic: 'Hier 15:30',
      technicienDemandeur: 'Sami Khelifi (Technicien Interne CRE)',
      etablissementDestination: 'Lycée Asad Ibn Al Fourat (Oued Ellil)',
      motifMission: 'Dépannage alimentation PC Fixe et rétablissement liaison Flybox secours',
      dateDemandee: '27/10/2026 à 09h00',
      equipementsConcernes: 'PC Dell OptiPlex (S/N: SN-DELL-883921)',
      statut: 'VALIDE_AVEC_VEHICULE',
      statutLabel: 'Validé & Véhicule Affecté',
      vehiculeAffecte: 'Peugeot Partner (204 TU 1150)',
      chauffeurAffecte: 'Amor Trabelsi'
    },
    {
      id: 'DEM-03',
      omNumero: 'OM-2026-0175',
      dateTransmissionSdTic: '24/10/2026',
      technicienDemandeur: 'Équipe Mobile CRE',
      etablissementDestination: 'Lycée Borj El Amri',
      motifMission: 'Vérification câblage fibre et switch d\'étage',
      dateDemandee: '25/10/2026 à 10h00',
      equipementsConcernes: 'Switch Cisco 2960 (S/N: SN-CSCO-992144)',
      statut: 'AJOURNE_REPORTE',
      statutLabel: 'Ajourné à une autre date par le SD-Bâtiments',
      dateAjournee: '29/10/2026',
      motifAjournement: 'Indisponibilité de véhicule léger utilitaire (tous les véhicules mobilisés pour acheminement matériel examens).'
    }
  ];

  // Modal Validation avec Chauffeur et Voiture
  selectedDemandeForValidation: DemandeVoitureMission | null = null;
  affectationForm = {
    vehicule: 'Peugeot Partner (204 TU 1150)',
    chauffeur: 'Amor Trabelsi'
  };

  // Modal Ajournement / Report
  selectedDemandeForAjournement: DemandeVoitureMission | null = null;
  ajournementForm = {
    nouvelleDate: '',
    motif: 'Indisponibilité temporaire de véhicule de service suite à révision mécanique obligatoire.'
  };

  toastMessage = '';

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 3);
    this.ajournementForm.nouvelleDate = nextWeek.toISOString().split('T')[0];
  }

  // 1. Validation de la demande de voiture
  ouvrirModalValidation(dem: DemandeVoitureMission): void {
    this.selectedDemandeForValidation = dem;
    const dispoVeh = this.vehiculesList.find(v => v.statut === 'DISPONIBLE');
    if (dispoVeh) {
      this.affectationForm.vehicule = `${dispoVeh.marqueModele} (${dispoVeh.immatriculation})`;
    }
    const dispoChf = this.chauffeursList.find(c => c.statut === 'DISPONIBLE');
    if (dispoChf) {
      this.affectationForm.chauffeur = dispoChf.nomPrenom;
    }
  }

  confirmerValidationVehicule(): void {
    if (!this.selectedDemandeForValidation) return;

    this.selectedDemandeForValidation.statut = 'VALIDE_AVEC_VEHICULE';
    this.selectedDemandeForValidation.statutLabel = 'Validé avec Véhicule & Chauffeur';
    this.selectedDemandeForValidation.vehiculeAffecte = this.affectationForm.vehicule;
    this.selectedDemandeForValidation.chauffeurAffecte = this.affectationForm.chauffeur;

    this.afficherToast(`✅ Demande ${this.selectedDemandeForValidation.omNumero} validée ! Véhicule "${this.affectationForm.vehicule}" et Chauffeur "${this.affectationForm.chauffeur}" affectés.`);
    this.selectedDemandeForValidation = null;
  }

  // 2. Ajournement de la demande
  ouvrirModalAjournement(dem: DemandeVoitureMission): void {
    this.selectedDemandeForAjournement = dem;
  }

  confirmerAjournement(): void {
    if (!this.selectedDemandeForAjournement) return;
    if (!this.ajournementForm.nouvelleDate) {
      alert('Veuillez préciser la nouvelle date de report convenue.');
      return;
    }

    this.selectedDemandeForAjournement.statut = 'AJOURNE_REPORTE';
    this.selectedDemandeForAjournement.statutLabel = 'Ajourné à une autre date par le SD-Bâtiments';
    this.selectedDemandeForAjournement.dateAjournee = this.ajournementForm.nouvelleDate;
    this.selectedDemandeForAjournement.motifAjournement = this.ajournementForm.motif;

    this.afficherToast(`⚠️ Demande ${this.selectedDemandeForAjournement.omNumero} ajournée au ${this.ajournementForm.nouvelleDate}. Notification envoyée au SD-TIC.`);
    this.selectedDemandeForAjournement = null;
  }

  afficherToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = '';
    }, 4500);
  }
}
