import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserAccount } from '../../core/services/auth.service';

export interface EquipementLabo {
  id: string;
  numeroSerie: string;
  type: string;
  marque: string;
  etat: 'FONCTIONNEL' | 'EN_PANNE' | 'ENDOMMAGE_CHOC' | 'PERDU';
  posteNumero: string;
}

export interface DeclarationProf {
  id: string;
  type: 'PANNE' | 'CHOC_ELECTRIQUE' | 'PERTE';
  numeroSerie: string;
  equipementNom: string;
  description: string;
  date: string;
  destinataires: string;
  justificatifPvNom?: string;
  statut: 'TRANSMIS_DIRECTEUR_INSPECTEUR' | 'PRIS_EN_CHARGE';
}

@Component({
  selector: 'app-prof-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prof-dashboard.component.html',
  styleUrls: ['./prof-dashboard.component.scss']
})
export class ProfDashboardComponent implements OnInit {
  currentUser: UserAccount | null = null;
  activeTab: 'inventaire' | 'bac-pratique' | 'declarations' | 'arrivage' = 'inventaire';

  // Labo rattaché au prof
  laboNom = 'Laboratoire Informatique 1';
  etablissementNom = 'Lycée Ibn Abi Dhiaf - Manouba';

  // Matériels du labo avec NUMÉRO DE SÉRIE obligatoire
  equipementsList: EquipementLabo[] = [
    { id: 'EQ-01', numeroSerie: 'SN-DELL-3080-01', type: 'PC Fixe', marque: 'Dell OptiPlex 3080', etat: 'FONCTIONNEL', posteNumero: 'Poste Élève 01' },
    { id: 'EQ-02', numeroSerie: 'SN-DELL-3080-02', type: 'PC Fixe', marque: 'Dell OptiPlex 3080', etat: 'FONCTIONNEL', posteNumero: 'Poste Élève 02' },
    { id: 'EQ-03', numeroSerie: 'SN-DELL-3080-03', type: 'PC Fixe', marque: 'Dell OptiPlex 3080', etat: 'EN_PANNE', posteNumero: 'Poste Élève 03' },
    { id: 'EQ-04', numeroSerie: 'SN-SCR-24-04', type: 'Écran', marque: 'Dell 24" P2419H', etat: 'FONCTIONNEL', posteNumero: 'Poste Élève 04' },
    { id: 'EQ-05', numeroSerie: 'SN-HP-M404-01', type: 'Imprimante', marque: 'HP LaserJet Pro M404n', etat: 'FONCTIONNEL', posteNumero: 'Table Imprimante' },
    { id: 'EQ-06', numeroSerie: 'SN-CSCO-2960-01', type: 'Switch Réseau', marque: 'Cisco Catalyst 2960', etat: 'FONCTIONNEL', posteNumero: 'Baie Réseau' }
  ];

  // Arrivage en attente de la 3ème confirmation (Prof Responsable de Labo)
  arrivageEnAttente = {
    numero: 'ARR-2026-0042',
    designation: 'Livraison 8 Postes PC Dell & Écrans pour Labo Info 1',
    bonLivraison: 'BL-COMP-2026-8841',
    nombreEquipements: 8,
    confirmeParSDTIC: true,
    confirmeParDirecteur: true,
    confirmeParProf: false,
    equipements: [
      { sn: 'SN-DELL-NEW-01', type: 'PC Fixe', modele: 'Dell OptiPlex 7010' },
      { sn: 'SN-DELL-NEW-02', type: 'PC Fixe', modele: 'Dell OptiPlex 7010' },
      { sn: 'SN-SCR-NEW-01', type: 'Écran', modele: 'Dell 24" P2422H' },
      { sn: 'SN-SCR-NEW-02', type: 'Écran', modele: 'Dell 24" P2422H' }
    ]
  };

  // Préparation du Bac Pratique
  bacEngagement = {
    soumis: true,
    valideDirecteur: false,
    dateSoumission: '2026-10-25 14:00',
    totalPostesRequis: 24,
    postesPrets: 23,
    environnementsInstalles: true,
    reseauIsole: true,
    commentaire: 'Installation de Python 3.11, Thonny, VS Code et MySQL terminée sur 23 postes. 1 poste (n°3) en panne d\'alimentation.'
  };

  // Déclarations avec N° DE SÉRIE faites par le prof à l'attention du Directeur et de l'Inspecteur
  declarationsList: DeclarationProf[] = [
    {
      id: 'DEC-2026-0012',
      type: 'CHOC_ELECTRIQUE',
      numeroSerie: 'SN-DELL-3080-03',
      equipementNom: 'PC Fixe Dell OptiPlex 3080 (Poste Élève 03)',
      description: 'Arrêt brutal avec fumée suite à surtension électrique orageuse sur le réseau du bâtiment. Carte mère et alimentation brûlées.',
      date: '2026-10-25',
      destinataires: 'Directeur d\'Établissement & Inspecteur Pédagogique TIC',
      statut: 'TRANSMIS_DIRECTEUR_INSPECTEUR'
    }
  ];

  // Modal Nouvelle Déclaration
  showDeclarationModal = false;
  nouvelleDeclaration = {
    type: 'CHOC_ELECTRIQUE' as DeclarationProf['type'],
    numeroSerie: '',
    equipementNom: '',
    description: '',
    justificatifPvNom: ''
  };

  toastMessage = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
  }

  validerReceptionArrivage(): void {
    this.arrivageEnAttente.confirmeParProf = true;
    this.afficherToast('✅ Réception du matériel confirmée par le Prof Responsable. L\'arrivage passe à l\'état « Fonctionnel ».');
  }

  soumettreEngagementBac(): void {
    this.bacEngagement.soumis = true;
    this.bacEngagement.dateSoumission = new Date().toLocaleString();
    this.afficherToast('✅ Engagement de préparation du labo transmis. En attente de validation par le Directeur d\'Établissement.');
  }

  ouvrirModalDeclaration(type: DeclarationProf['type']): void {
    this.nouvelleDeclaration.type = type;
    this.nouvelleDeclaration.numeroSerie = '';
    this.nouvelleDeclaration.equipementNom = '';
    this.nouvelleDeclaration.description = '';
    this.showDeclarationModal = true;
  }

  soumettreDeclaration(): void {
    if (!this.nouvelleDeclaration.numeroSerie.trim()) {
      alert('Le Numéro de Série est obligatoire pour toute déclaration de panne, choc électrique ou perte.');
      return;
    }
    if (!this.nouvelleDeclaration.description.trim()) {
      alert('Veuillez renseigner le motif de la déclaration.');
      return;
    }

    const dec: DeclarationProf = {
      id: `DEC-2026-${String(this.declarationsList.length + 13).padStart(4, '0')}`,
      type: this.nouvelleDeclaration.type,
      numeroSerie: this.nouvelleDeclaration.numeroSerie,
      equipementNom: this.nouvelleDeclaration.equipementNom || 'Matériel Labo Info 1',
      description: this.nouvelleDeclaration.description,
      date: new Date().toISOString().split('T')[0],
      destinataires: 'Directeur d\'Établissement & Inspecteur Pédagogique TIC',
      justificatifPvNom: this.nouvelleDeclaration.justificatifPvNom,
      statut: 'TRANSMIS_DIRECTEUR_INSPECTEUR'
    };

    this.declarationsList = [dec, ...this.declarationsList];
    this.showDeclarationModal = false;
    this.afficherToast('✅ Déclaration enregistrée et transmise simultanément au Directeur et à l\'Inspecteur.');
  }

  afficherToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => this.toastMessage = '', 4000);
  }
}
