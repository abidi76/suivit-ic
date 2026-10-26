import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserAccount } from '../../core/services/auth.service';

export interface InterventionEquipement {
  id?: string;
  type: string;
  marqueModele: string;
  numeroSerie: string;
  panneConstatee: string;
}

export interface InterventionTechnicien {
  id: string;
  etablissement: string;
  labo: string;
  panneSignalee: string;
  criticite: string;
  bacPratique: boolean;
  omNumero: string;
  vehicule: string;
  chauffeur: string;
  datePrevue: string;
  statut: 'A_TRAITER' | 'EN_COURS' | 'TERMINEE_ATTENTE_VALIDATION';
  // Données de l'équipement
  equipementNom: string;
  numeroSerieEquipement: string;
  equipements?: InterventionEquipement[];
  // Rapport d'intervention
  rapportDetaille?: string;
  pieceAjouteeDesignation?: string;
  pieceAjouteeNumeroSerie?: string;
  pieceRetireeNumeroSerie?: string;
}

@Component({
  selector: 'app-technicien-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './technicien-dashboard.component.html',
  styleUrls: ['./technicien-dashboard.component.scss']
})
export class TechnicienDashboardComponent implements OnInit {
  currentUser: UserAccount | null = null;
  activeTab: 'missions' | 'saisie-rapport' = 'missions';

  // Interventions et Ordres de Mission assignés à ce technicien
  missionsList: InterventionTechnicien[] = [
    {
      id: 'INT-2026-0041',
      etablissement: 'Lycée Asad Ibn Al Fourat (Oued Ellil)',
      labo: 'Labo Info 1',
      panneSignalee: 'Alimentation défectueuse (ne démarre plus suite surtension)',
      criticite: 'HAUTE',
      bacPratique: true,
      omNumero: 'OM-2026-0188',
      vehicule: 'Peugeot Partner (204 TU 1150)',
      chauffeur: 'Amor Trabelsi',
      datePrevue: 'Aujourd\'hui 09:00',
      statut: 'EN_COURS',
      equipementNom: 'PC Fixe Dell OptiPlex 3080',
      numeroSerieEquipement: 'SN-DELL-883921',
      equipements: [
        { id: 'eq-1', type: 'PC Fixe', marqueModele: 'Dell OptiPlex 3080', numeroSerie: 'SN-DELL-883921', panneConstatee: 'Bloc d\'alimentation grillé, surtension orageuse' }
      ]
    },
    {
      id: 'INT-2026-0045',
      etablissement: 'Lycée Ibn Abi Dhiaf (Manouba)',
      labo: 'Labo Informatique 2',
      panneSignalee: '5 Écrans Dell sans affichage suite coupure électrique',
      criticite: 'CRITIQUE',
      bacPratique: true,
      omNumero: 'OM-2026-0192',
      vehicule: 'Renault Kangoo (185 TU 4421)',
      chauffeur: 'Hédi Baccouche',
      datePrevue: 'Demain 08:30',
      statut: 'A_TRAITER',
      equipementNom: 'Lot de 5 Écrans Dell 24"',
      numeroSerieEquipement: 'SN-SCR-4401, SN-SCR-4402, SN-SCR-4403, SN-SCR-4404, SN-SCR-4405',
      equipements: [
        { id: 'eq-1', type: 'Écran', marqueModele: 'Dell 24" P2419H', numeroSerie: 'SN-SCR-4401', panneConstatee: 'Affichage noir complet' },
        { id: 'eq-2', type: 'Écran', marqueModele: 'Dell 24" P2419H', numeroSerie: 'SN-SCR-4402', panneConstatee: 'Voyant clignotant orange, alim HS' },
        { id: 'eq-3', type: 'Écran', marqueModele: 'Dell 24" P2419H', numeroSerie: 'SN-SCR-4403', panneConstatee: 'Grésillement interne et extinction' },
        { id: 'eq-4', type: 'Écran', marqueModele: 'Dell 24" P2419H', numeroSerie: 'SN-SCR-4404', panneConstatee: 'Ports HDMI et DP non reconnus' },
        { id: 'eq-5', type: 'Écran', marqueModele: 'Dell 24" P2419H', numeroSerie: 'SN-SCR-4405', panneConstatee: 'Dalle endommagée / rétroéclairage' }
      ]
    },
    {
      id: 'INT-2026-0036',
      etablissement: 'Lycée Mornaguia',
      labo: 'Local Technique Bât B',
      panneSignalee: 'Coupure ports 12-16 switch Cisco salle profs',
      criticite: 'CRITIQUE',
      bacPratique: false,
      omNumero: 'OM-2026-0171',
      vehicule: 'Peugeot Partner',
      chauffeur: 'Amor Trabelsi',
      datePrevue: 'Terminé hier',
      statut: 'TERMINEE_ATTENTE_VALIDATION',
      equipementNom: 'Switch Cisco Catalyst 2960',
      numeroSerieEquipement: 'SN-CSCO-992144',
      equipements: [
        { id: 'eq-sw-1', type: 'Switch Réseau', marqueModele: 'Cisco Catalyst 2960', numeroSerie: 'SN-CSCO-992144', panneConstatee: 'Module SFP fibre défectueux' }
      ],
      rapportDetaille: 'Remplacement module SFP fibre + reprogrammation VLAN. Test de débit conforme 1 Gbps.',
      pieceAjouteeDesignation: 'Module SFP Gigabit Cisco',
      pieceAjouteeNumeroSerie: 'SN-SFP-77441',
      pieceRetireeNumeroSerie: 'SN-SFP-OLD-1102'
    }
  ];

  selectedMissionForReport: InterventionTechnicien | null = null;
  formRapport = {
    numeroSerieEquipement: '',
    rapportDetaille: '',
    pieceAjouteeDesignation: '',
    pieceAjouteeNumeroSerie: '',
    pieceRetireeNumeroSerie: ''
  };

  toastMessage = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
  }

  ouvrirFormulaireRapport(m: InterventionTechnicien): void {
    this.selectedMissionForReport = m;
    this.formRapport = {
      numeroSerieEquipement: m.numeroSerieEquipement,
      rapportDetaille: m.rapportDetaille || '',
      pieceAjouteeDesignation: m.pieceAjouteeDesignation || '',
      pieceAjouteeNumeroSerie: m.pieceAjouteeNumeroSerie || '',
      pieceRetireeNumeroSerie: m.pieceRetireeNumeroSerie || ''
    };
    this.activeTab = 'saisie-rapport';
  }

  soumettreRapport(): void {
    if (!this.selectedMissionForReport) return;
    if (!this.formRapport.numeroSerieEquipement.trim()) {
      alert('Le Numéro de Série de l\'équipement est strictement obligatoire pour toute intervention.');
      return;
    }
    if (!this.formRapport.rapportDetaille.trim()) {
      alert('Veuillez renseigner le rapport technique des travaux réalisés.');
      return;
    }

    this.selectedMissionForReport.numeroSerieEquipement = this.formRapport.numeroSerieEquipement;
    this.selectedMissionForReport.rapportDetaille = this.formRapport.rapportDetaille;
    this.selectedMissionForReport.pieceAjouteeDesignation = this.formRapport.pieceAjouteeDesignation;
    this.selectedMissionForReport.pieceAjouteeNumeroSerie = this.formRapport.pieceAjouteeNumeroSerie;
    this.selectedMissionForReport.pieceRetireeNumeroSerie = this.formRapport.pieceRetireeNumeroSerie;
    this.selectedMissionForReport.statut = 'TERMINEE_ATTENTE_VALIDATION';

    this.afficherToast('✅ Rapport d\'intervention enregistré et transmis au Directeur d\'Établissement pour validation finale.');
    this.activeTab = 'missions';
    this.selectedMissionForReport = null;
  }

  afficherToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => this.toastMessage = '', 4000);
  }
}
