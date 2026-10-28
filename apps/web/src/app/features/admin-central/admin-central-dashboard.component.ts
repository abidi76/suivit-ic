import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserAccount } from '../../core/services/auth.service';
import { 
  ComptesDemandesService, 
  DemandeCompteElissaEdunet, 
  AdminAdjointCompte 
} from '../../core/services/comptes-demandes.service';
import { Observable } from 'rxjs';

export interface CreSupervision {
  id: string;
  nom: string;
  gouvernorat: string;
  sdticNom: string;
  sdticEmail: string;
  sdticActif: boolean;
  totalEtablissements: number;
  totalEquipements: number;
  enService: number;
  enPanne: number;
  pannesDetail: {
    pcBureau: number;
    pcPortable: number;
    imprimanteScanner: number;
    reseauSwitch: number;
  };
  arrivagesEnAttente: number;
  reclamationsOuvertes: number;
}

export interface ResponsableTicAccount {
  id: string;
  creId: string;
  creNom: string;
  matricule: string;
  nom: string;
  prenom: string;
  roleTitre: 'SD_TIC' | 'DIRECTEUR_TIC';
  roleLabel: string;
  email: string;
  telephone: string;
  actif: boolean;
  dateNomination?: string;
}

export interface AdjointManagement {
  id: string;
  nom: string;
  email: string;
  matricule?: string;
  telephone?: string;
  actif?: boolean;
  tachesAutorisees: {
    arrivages: boolean;
    inventaires: boolean;
    pannesPertes: boolean;
    comptesLocaux: boolean;
    rapports: boolean;
    comptesElissaEdunet: boolean;
  };
}

@Component({
  selector: 'app-admin-central-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-central-dashboard.component.html',
  styleUrls: ['./admin-central-dashboard.component.scss']
})
export class AdminCentralDashboardComponent implements OnInit {
  currentUser: UserAccount | null = null;
  activeTab: 'global' | 'cre-list' | 'adjoints' | 'arrivages' | 'comptes-elissa-edunet' = 'global';

  // Filtres multidimensionnels nationaux
  selectedCre = 'TOUS';
  selectedEtabType = 'TOUS';
  selectedAppelOffre = 'TOUS';
  selectedStatut = 'TOUS';
  searchTerm = '';

  // Filtres Demandes Comptes Elissa & Edunet
  filtrePlateformeCentral: 'TOUS' | 'ELISSA' | 'EDUNET' = 'TOUS';
  filtreStatutCentral: string = 'TOUS';
  filtreCreDemande: string = 'TOUS';

  // Observables des demandes de comptes et des adjoints
  demandesComptes$!: Observable<DemandeCompteElissaEdunet[]>;

  // Modal d'approbation et génération des identifiants
  showModalApprobation = false;
  demandeAApprouver: DemandeCompteElissaEdunet | null = null;
  idGenere = '';
  mdpGenere = '';

  // Modal de rejet de demande
  showModalRejet = false;
  demandeARejeter: DemandeCompteElissaEdunet | null = null;
  motifRejet = '';

  // Modal d'ajout d'un nouveau compte Admin Adjoint (Réservé à l'Admin Central)
  showModalNouvelAdjoint = false;
  formNouvelAdjoint = {
    nom: '',
    prenom: '',
    matricule: 'ADJ-1005',
    email: '',
    telephone: '+216 71 568 205',
    taches: {
      arrivages: false,
      inventaires: true,
      pannesPertes: false,
      comptesLocaux: false,
      rapports: true,
      comptesElissaEdunet: true
    }
  };

  // Modal de modification / MAJ d'un compte Admin Adjoint
  showModalModifierAdjoint = false;
  formModifierAdjoint: AdjointManagement = {
    id: '',
    nom: '',
    email: '',
    matricule: '',
    telephone: '',
    actif: true,
    tachesAutorisees: {
      arrivages: false,
      inventaires: false,
      pannesPertes: false,
      comptesLocaux: false,
      rapports: false,
      comptesElissaEdunet: false
    }
  };

  // Modal d'ajout d'un nouveau Responsable TIC régional (SD TIC / Directeur TIC)
  showModalNouveauResponsable = false;
  formNouveauResponsable: ResponsableTicAccount = {
    id: '',
    creId: 'CRE-05',
    creNom: 'CRE Manouba',
    matricule: 'TIC-127',
    nom: '',
    prenom: '',
    roleTitre: 'SD_TIC',
    roleLabel: 'Sous-Directeur TIC',
    email: '',
    telephone: '+216 71 000 000',
    actif: true
  };

  // Modal de modification d'un Responsable TIC régional
  showModalModifierResponsable = false;
  formModifierResponsable: ResponsableTicAccount = {
    id: '',
    creId: '',
    creNom: '',
    matricule: '',
    nom: '',
    prenom: '',
    roleTitre: 'SD_TIC',
    roleLabel: '',
    email: '',
    telephone: '',
    actif: true
  };

  // Liste des Responsables TIC (SD-TIC & Directeurs TIC) gérés par l'Admin Central
  responsablesTicList: ResponsableTicAccount[] = [
    { id: 'RESP-01', creId: 'CRE-01', creNom: 'CRE Tunis 1', matricule: 'TIC-101', nom: 'Trabelsi', prenom: 'Kamel', roleTitre: 'DIRECTEUR_TIC', roleLabel: 'Directeur Régional TIC', email: 'directeurtic.tunis1@edunet.tn', telephone: '+216 71 800 101', actif: true, dateNomination: '15/09/2021' },
    { id: 'RESP-02', creId: 'CRE-02', creNom: 'CRE Tunis 2', matricule: 'TIC-102', nom: 'Cherif', prenom: 'Mourad', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.tunis2@edunet.tn', telephone: '+216 71 800 102', actif: true, dateNomination: '01/10/2022' },
    { id: 'RESP-03', creId: 'CRE-03', creNom: 'CRE Ariana', matricule: 'TIC-103', nom: 'Riahi', prenom: 'Leila', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directrice TIC', email: 'sdtic.ariana@edunet.tn', telephone: '+216 71 700 103', actif: true, dateNomination: '12/01/2023' },
    { id: 'RESP-04', creId: 'CRE-04', creNom: 'CRE Ben Arous', matricule: 'TIC-104', nom: 'Chahed', prenom: 'Anis', roleTitre: 'DIRECTEUR_TIC', roleLabel: 'Directeur Régional TIC', email: 'directeurtic.benarous@edunet.tn', telephone: '+216 71 300 104', actif: true, dateNomination: '05/03/2020' },
    { id: 'RESP-05', creId: 'CRE-05', creNom: 'CRE Manouba', matricule: 'TIC-105', nom: 'Gharbi', prenom: 'Mohamed', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.manouba@edunet.tn', telephone: '+216 71 600 105', actif: true, dateNomination: '20/11/2022' },
    { id: 'RESP-06', creId: 'CRE-06', creNom: 'CRE Nabeul', matricule: 'TIC-106', nom: 'Ben Romdhane', prenom: 'Foued', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.nabeul@edunet.tn', telephone: '+216 72 200 106', actif: true, dateNomination: '14/06/2021' },
    { id: 'RESP-07', creId: 'CRE-07', creNom: 'CRE Zaghouan', matricule: 'TIC-107', nom: 'Hamdi', prenom: 'Tarek', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.zaghouan@edunet.tn', telephone: '+216 72 670 107', actif: true, dateNomination: '01/09/2023' },
    { id: 'RESP-08', creId: 'CRE-08', creNom: 'CRE Bizerte', matricule: 'TIC-108', nom: 'Dridi', prenom: 'Zouhair', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.bizerte@edunet.tn', telephone: '+216 72 400 108', actif: true, dateNomination: '15/02/2022' },
    { id: 'RESP-09', creId: 'CRE-09', creNom: 'CRE Béja', matricule: 'TIC-109', nom: 'Mejri', prenom: 'Mongi', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.beja@edunet.tn', telephone: '+216 78 450 109', actif: true, dateNomination: '10/11/2021' },
    { id: 'RESP-10', creId: 'CRE-10', creNom: 'CRE Jendouba', matricule: 'TIC-110', nom: 'Gharbi', prenom: 'Chokri', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.jendouba@edunet.tn', telephone: '+216 78 600 110', actif: true, dateNomination: '01/04/2022' },
    { id: 'RESP-11', creId: 'CRE-11', creNom: 'CRE Le Kef', matricule: 'TIC-111', nom: 'Bouzidi', prenom: 'Habib', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.lekef@edunet.tn', telephone: '+216 78 200 111', actif: true, dateNomination: '18/10/2020' },
    { id: 'RESP-12', creId: 'CRE-12', creNom: 'CRE Siliana', matricule: 'TIC-112', nom: 'Ayari', prenom: 'Moncef', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.siliana@edunet.tn', telephone: '+216 78 870 112', actif: true, dateNomination: '01/12/2022' },
    { id: 'RESP-13', creId: 'CRE-13', creNom: 'CRE Sousse', matricule: 'TIC-113', nom: 'Ben Ammar', prenom: 'Walid', roleTitre: 'DIRECTEUR_TIC', roleLabel: 'Directeur Régional TIC', email: 'directeurtic.sousse@edunet.tn', telephone: '+216 73 200 113', actif: true, dateNomination: '05/01/2021' },
    { id: 'RESP-14', creId: 'CRE-14', creNom: 'CRE Monastir', matricule: 'TIC-114', nom: 'Khelil', prenom: 'Ridha', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.monastir@edunet.tn', telephone: '+216 73 460 114', actif: true, dateNomination: '20/08/2022' },
    { id: 'RESP-15', creId: 'CRE-15', creNom: 'CRE Mahdia', matricule: 'TIC-115', nom: 'Sassi', prenom: 'Amor', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.mahdia@edunet.tn', telephone: '+216 73 680 115', actif: true, dateNomination: '14/05/2023' },
    { id: 'RESP-16', creId: 'CRE-16', creNom: 'CRE Sfax 1', matricule: 'TIC-116', nom: 'Fakhfakh', prenom: 'Hichem', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.sfax1@edunet.tn', telephone: '+216 74 200 116', actif: true, dateNomination: '10/03/2021' },
    { id: 'RESP-17', creId: 'CRE-17', creNom: 'CRE Sfax 2', matricule: 'TIC-117', nom: 'Louati', prenom: 'Nabil', roleTitre: 'DIRECTEUR_TIC', roleLabel: 'Directeur Régional TIC', email: 'directeurtic.sfax2@edunet.tn', telephone: '+216 74 400 117', actif: true, dateNomination: '01/02/2020' },
    { id: 'RESP-18', creId: 'CRE-18', creNom: 'CRE Kairouan', matricule: 'TIC-118', nom: 'Hammami', prenom: 'Brahim', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.kairouan@edunet.tn', telephone: '+216 77 220 118', actif: true, dateNomination: '15/09/2022' },
    { id: 'RESP-19', creId: 'CRE-19', creNom: 'CRE Kasserine', matricule: 'TIC-119', nom: 'Rahmouni', prenom: 'Lotfi', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.kasserine@edunet.tn', telephone: '+216 77 470 119', actif: true, dateNomination: '01/11/2021' },
    { id: 'RESP-20', creId: 'CRE-20', creNom: 'CRE Sidi Bouzid', matricule: 'TIC-120', nom: 'Dabbabi', prenom: 'Abdelkader', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.sidibouzid@edunet.tn', telephone: '+216 76 630 120', actif: true, dateNomination: '12/04/2023' },
    { id: 'RESP-21', creId: 'CRE-21', creNom: 'CRE Gafsa', matricule: 'TIC-121', nom: 'Gouader', prenom: 'Hedi', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.gafsa@edunet.tn', telephone: '+216 76 220 121', actif: true, dateNomination: '15/01/2022' },
    { id: 'RESP-22', creId: 'CRE-22', creNom: 'CRE Tozeur', matricule: 'TIC-122', nom: 'Marzouki', prenom: 'Salem', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.tozeur@edunet.tn', telephone: '+216 76 450 122', actif: true, dateNomination: '01/10/2022' },
    { id: 'RESP-23', creId: 'CRE-23', creNom: 'CRE Kébili', matricule: 'TIC-123', nom: 'Saad', prenom: 'Mabrouk', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.kebili@edunet.tn', telephone: '+216 75 490 123', actif: true, dateNomination: '01/09/2023' },
    { id: 'RESP-24', creId: 'CRE-24', creNom: 'CRE Gabès', matricule: 'TIC-124', nom: 'Chaabani', prenom: 'Farhat', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.gabes@edunet.tn', telephone: '+216 75 270 124', actif: true, dateNomination: '14/07/2021' },
    { id: 'RESP-25', creId: 'CRE-25', creNom: 'CRE Médenine', matricule: 'TIC-125', nom: 'Ghomrasni', prenom: 'Ali', roleTitre: 'DIRECTEUR_TIC', roleLabel: 'Directeur Régional TIC', email: 'directeurtic.medenine@edunet.tn', telephone: '+216 75 640 125', actif: true, dateNomination: '10/02/2020' },
    { id: 'RESP-26', creId: 'CRE-26', creNom: 'CRE Tataouine', matricule: 'TIC-126', nom: 'Abdelmoula', prenom: 'Béchir', roleTitre: 'SD_TIC', roleLabel: 'Sous-Directeur TIC', email: 'sdtic.tataouine@edunet.tn', telephone: '+216 75 860 126', actif: true, dateNomination: '01/11/2022' }
  ];

  // Liste officielle et complète des 26 Commissariats Régionaux de l'Éducation (CRE) de la République Tunisienne
  creList: CreSupervision[] = [
    { id: 'CRE-01', nom: 'CRE Tunis 1', gouvernorat: 'Tunis', sdticNom: 'Kamel Trabelsi (Directeur TIC)', sdticEmail: 'directeurtic.tunis1@edunet.tn', sdticActif: true, totalEtablissements: 88, totalEquipements: 3950, enService: 3580, enPanne: 270, pannesDetail: { pcBureau: 160, pcPortable: 55, imprimanteScanner: 35, reseauSwitch: 20 }, arrivagesEnAttente: 4, reclamationsOuvertes: 28 },
    { id: 'CRE-02', nom: 'CRE Tunis 2', gouvernorat: 'Tunis', sdticNom: 'Mourad Cherif (SD TIC)', sdticEmail: 'sdtic.tunis2@edunet.tn', sdticActif: true, totalEtablissements: 76, totalEquipements: 3340, enService: 3010, enPanne: 210, pannesDetail: { pcBureau: 125, pcPortable: 40, imprimanteScanner: 30, reseauSwitch: 15 }, arrivagesEnAttente: 3, reclamationsOuvertes: 21 },
    { id: 'CRE-03', nom: 'CRE Ariana', gouvernorat: 'Ariana', sdticNom: 'Leila Riahi (SD TIC)', sdticEmail: 'sdtic.ariana@edunet.tn', sdticActif: true, totalEtablissements: 62, totalEquipements: 2680, enService: 2410, enPanne: 180, pannesDetail: { pcBureau: 105, pcPortable: 38, imprimanteScanner: 25, reseauSwitch: 12 }, arrivagesEnAttente: 2, reclamationsOuvertes: 16 },
    { id: 'CRE-04', nom: 'CRE Ben Arous', gouvernorat: 'Ben Arous', sdticNom: 'Anis Chahed (Directeur TIC)', sdticEmail: 'directeurtic.benarous@edunet.tn', sdticActif: true, totalEtablissements: 68, totalEquipements: 2940, enService: 2620, enPanne: 220, pannesDetail: { pcBureau: 130, pcPortable: 45, imprimanteScanner: 30, reseauSwitch: 15 }, arrivagesEnAttente: 3, reclamationsOuvertes: 24 },
    { id: 'CRE-05', nom: 'CRE Manouba', gouvernorat: 'Manouba', sdticNom: 'Mohamed Gharbi (SD TIC)', sdticEmail: 'sdtic.manouba@edunet.tn', sdticActif: true, totalEtablissements: 48, totalEquipements: 1840, enService: 1612, enPanne: 148, pannesDetail: { pcBureau: 92, pcPortable: 32, imprimanteScanner: 16, reseauSwitch: 8 }, arrivagesEnAttente: 3, reclamationsOuvertes: 19 },
    { id: 'CRE-06', nom: 'CRE Nabeul', gouvernorat: 'Nabeul', sdticNom: 'Foued Ben Romdhane (SD TIC)', sdticEmail: 'sdtic.nabeul@edunet.tn', sdticActif: true, totalEtablissements: 84, totalEquipements: 3420, enService: 3080, enPanne: 240, pannesDetail: { pcBureau: 140, pcPortable: 50, imprimanteScanner: 32, reseauSwitch: 18 }, arrivagesEnAttente: 4, reclamationsOuvertes: 27 },
    { id: 'CRE-07', nom: 'CRE Zaghouan', gouvernorat: 'Zaghouan', sdticNom: 'Tarek Hamdi (SD TIC)', sdticEmail: 'sdtic.zaghouan@edunet.tn', sdticActif: true, totalEtablissements: 36, totalEquipements: 1220, enService: 1090, enPanne: 90, pannesDetail: { pcBureau: 55, pcPortable: 18, imprimanteScanner: 12, reseauSwitch: 5 }, arrivagesEnAttente: 1, reclamationsOuvertes: 9 },
    { id: 'CRE-08', nom: 'CRE Bizerte', gouvernorat: 'Bizerte', sdticNom: 'Zouhair Dridi (SD TIC)', sdticEmail: 'sdtic.bizerte@edunet.tn', sdticActif: true, totalEtablissements: 66, totalEquipements: 2540, enService: 2260, enPanne: 190, pannesDetail: { pcBureau: 110, pcPortable: 40, imprimanteScanner: 26, reseauSwitch: 14 }, arrivagesEnAttente: 2, reclamationsOuvertes: 18 },
    { id: 'CRE-09', nom: 'CRE Béja', gouvernorat: 'Béja', sdticNom: 'Mongi Mejri (SD TIC)', sdticEmail: 'sdtic.beja@edunet.tn', sdticActif: true, totalEtablissements: 44, totalEquipements: 1560, enService: 1380, enPanne: 130, pannesDetail: { pcBureau: 78, pcPortable: 28, imprimanteScanner: 16, reseauSwitch: 8 }, arrivagesEnAttente: 2, reclamationsOuvertes: 14 },
    { id: 'CRE-10', nom: 'CRE Jendouba', gouvernorat: 'Jendouba', sdticNom: 'Chokri Gharbi (SD TIC)', sdticEmail: 'sdtic.jendouba@edunet.tn', sdticActif: true, totalEtablissements: 52, totalEquipements: 1780, enService: 1540, enPanne: 160, pannesDetail: { pcBureau: 95, pcPortable: 34, imprimanteScanner: 20, reseauSwitch: 11 }, arrivagesEnAttente: 1, reclamationsOuvertes: 17 },
    { id: 'CRE-11', nom: 'CRE Le Kef', gouvernorat: 'Le Kef', sdticNom: 'Habib Bouzidi (SD TIC)', sdticEmail: 'sdtic.lekef@edunet.tn', sdticActif: true, totalEtablissements: 46, totalEquipements: 1490, enService: 1310, enPanne: 120, pannesDetail: { pcBureau: 72, pcPortable: 25, imprimanteScanner: 15, reseauSwitch: 8 }, arrivagesEnAttente: 2, reclamationsOuvertes: 11 },
    { id: 'CRE-12', nom: 'CRE Siliana', gouvernorat: 'Siliana', sdticNom: 'Moncef Ayari (SD TIC)', sdticEmail: 'sdtic.siliana@edunet.tn', sdticActif: true, totalEtablissements: 42, totalEquipements: 1380, enService: 1220, enPanne: 110, pannesDetail: { pcBureau: 66, pcPortable: 24, imprimanteScanner: 14, reseauSwitch: 6 }, arrivagesEnAttente: 1, reclamationsOuvertes: 10 },
    { id: 'CRE-13', nom: 'CRE Sousse', gouvernorat: 'Sousse', sdticNom: 'Walid Ben Ammar (Directeur TIC)', sdticEmail: 'directeurtic.sousse@edunet.tn', sdticActif: true, totalEtablissements: 78, totalEquipements: 3620, enService: 3290, enPanne: 240, pannesDetail: { pcBureau: 145, pcPortable: 52, imprimanteScanner: 28, reseauSwitch: 15 }, arrivagesEnAttente: 5, reclamationsOuvertes: 29 },
    { id: 'CRE-14', nom: 'CRE Monastir', gouvernorat: 'Monastir', sdticNom: 'Ridha Khelil (SD TIC)', sdticEmail: 'sdtic.monastir@edunet.tn', sdticActif: true, totalEtablissements: 64, totalEquipements: 2820, enService: 2570, enPanne: 180, pannesDetail: { pcBureau: 108, pcPortable: 38, imprimanteScanner: 22, reseauSwitch: 12 }, arrivagesEnAttente: 3, reclamationsOuvertes: 17 },
    { id: 'CRE-15', nom: 'CRE Mahdia', gouvernorat: 'Mahdia', sdticNom: 'Amor Sassi (SD TIC)', sdticEmail: 'sdtic.mahdia@edunet.tn', sdticActif: true, totalEtablissements: 54, totalEquipements: 2190, enService: 1950, enPanne: 160, pannesDetail: { pcBureau: 96, pcPortable: 33, imprimanteScanner: 20, reseauSwitch: 11 }, arrivagesEnAttente: 2, reclamationsOuvertes: 15 },
    { id: 'CRE-16', nom: 'CRE Sfax 1', gouvernorat: 'Sfax', sdticNom: 'Hichem Fakhfakh (SD TIC)', sdticEmail: 'sdtic.sfax1@edunet.tn', sdticActif: true, totalEtablissements: 74, totalEquipements: 3280, enService: 2960, enPanne: 220, pannesDetail: { pcBureau: 132, pcPortable: 46, imprimanteScanner: 27, reseauSwitch: 15 }, arrivagesEnAttente: 4, reclamationsOuvertes: 26 },
    { id: 'CRE-17', nom: 'CRE Sfax 2', gouvernorat: 'Sfax', sdticNom: 'Nabil Louati (Directeur TIC)', sdticEmail: 'directeurtic.sfax2@edunet.tn', sdticActif: true, totalEtablissements: 69, totalEquipements: 3120, enService: 2810, enPanne: 210, pannesDetail: { pcBureau: 126, pcPortable: 44, imprimanteScanner: 26, reseauSwitch: 14 }, arrivagesEnAttente: 3, reclamationsOuvertes: 22 },
    { id: 'CRE-18', nom: 'CRE Kairouan', gouvernorat: 'Kairouan', sdticNom: 'Brahim Hammami (SD TIC)', sdticEmail: 'sdtic.kairouan@edunet.tn', sdticActif: true, totalEtablissements: 72, totalEquipements: 2640, enService: 2290, enPanne: 250, pannesDetail: { pcBureau: 150, pcPortable: 50, imprimanteScanner: 32, reseauSwitch: 18 }, arrivagesEnAttente: 2, reclamationsOuvertes: 25 },
    { id: 'CRE-19', nom: 'CRE Kasserine', gouvernorat: 'Kasserine', sdticNom: 'Lotfi Rahmouni (SD TIC)', sdticEmail: 'sdtic.kasserine@edunet.tn', sdticActif: true, totalEtablissements: 65, totalEquipements: 2280, enService: 1970, enPanne: 210, pannesDetail: { pcBureau: 126, pcPortable: 42, imprimanteScanner: 28, reseauSwitch: 14 }, arrivagesEnAttente: 2, reclamationsOuvertes: 23 },
    { id: 'CRE-20', nom: 'CRE Sidi Bouzid', gouvernorat: 'Sidi Bouzid', sdticNom: 'Abdelkader Dabbabi (SD TIC)', sdticEmail: 'sdtic.sidibouzid@edunet.tn', sdticActif: true, totalEtablissements: 61, totalEquipements: 2150, enService: 1870, enPanne: 200, pannesDetail: { pcBureau: 120, pcPortable: 40, imprimanteScanner: 26, reseauSwitch: 14 }, arrivagesEnAttente: 2, reclamationsOuvertes: 20 },
    { id: 'CRE-21', nom: 'CRE Gafsa', gouvernorat: 'Gafsa', sdticNom: 'Hedi Gouader (SD TIC)', sdticEmail: 'sdtic.gafsa@edunet.tn', sdticActif: true, totalEtablissements: 56, totalEquipements: 2040, enService: 1790, enPanne: 180, pannesDetail: { pcBureau: 108, pcPortable: 36, imprimanteScanner: 24, reseauSwitch: 12 }, arrivagesEnAttente: 2, reclamationsOuvertes: 18 },
    { id: 'CRE-22', nom: 'CRE Tozeur', gouvernorat: 'Tozeur', sdticNom: 'Salem Marzouki (SD TIC)', sdticEmail: 'sdtic.tozeur@edunet.tn', sdticActif: true, totalEtablissements: 32, totalEquipements: 1110, enService: 1010, enPanne: 70, pannesDetail: { pcBureau: 42, pcPortable: 14, imprimanteScanner: 9, reseauSwitch: 5 }, arrivagesEnAttente: 1, reclamationsOuvertes: 8 },
    { id: 'CRE-23', nom: 'CRE Kébili', gouvernorat: 'Kébili', sdticNom: 'Mabrouk Saad (SD TIC)', sdticEmail: 'sdtic.kebili@edunet.tn', sdticActif: true, totalEtablissements: 34, totalEquipements: 1180, enService: 1060, enPanne: 80, pannesDetail: { pcBureau: 48, pcPortable: 16, imprimanteScanner: 11, reseauSwitch: 5 }, arrivagesEnAttente: 1, reclamationsOuvertes: 9 },
    { id: 'CRE-24', nom: 'CRE Gabès', gouvernorat: 'Gabès', sdticNom: 'Farhat Chaabani (SD TIC)', sdticEmail: 'sdtic.gabes@edunet.tn', sdticActif: true, totalEtablissements: 58, totalEquipements: 2340, enService: 2080, enPanne: 190, pannesDetail: { pcBureau: 114, pcPortable: 38, imprimanteScanner: 25, reseauSwitch: 13 }, arrivagesEnAttente: 3, reclamationsOuvertes: 19 },
    { id: 'CRE-25', nom: 'CRE Médenine', gouvernorat: 'Médenine', sdticNom: 'Ali Ghomrasni (Directeur TIC)', sdticEmail: 'directeurtic.medenine@edunet.tn', sdticActif: true, totalEtablissements: 70, totalEquipements: 2790, enService: 2470, enPanne: 220, pannesDetail: { pcBureau: 132, pcPortable: 44, imprimanteScanner: 28, reseauSwitch: 16 }, arrivagesEnAttente: 3, reclamationsOuvertes: 21 },
    { id: 'CRE-26', nom: 'CRE Tataouine', gouvernorat: 'Tataouine', sdticNom: 'Béchir Abdelmoula (SD TIC)', sdticEmail: 'sdtic.tataouine@edunet.tn', sdticActif: true, totalEtablissements: 33, totalEquipements: 1090, enService: 990, enPanne: 70, pannesDetail: { pcBureau: 42, pcPortable: 14, imprimanteScanner: 9, reseauSwitch: 5 }, arrivagesEnAttente: 1, reclamationsOuvertes: 7 }
  ];

  // Gestion des Admin Central-Adjoints
  // RÈGLE : Seul l'Admin Central titulaire affecte ou interdit des tâches aux adjoints
  adjointsList: AdjointManagement[] = [
    {
      id: 'ADJ-01',
      matricule: 'ADJ-1002',
      nom: 'Fatma Ben Romdhane',
      email: 'adjoint1@edunet.tn',
      telephone: '+216 71 568 200',
      tachesAutorisees: {
        arrivages: false,
        inventaires: true,
        pannesPertes: true,
        comptesLocaux: false,
        rapports: true,
        comptesElissaEdunet: true // Habilitée Elissa & Edunet
      }
    },
    {
      id: 'ADJ-02',
      matricule: 'ADJ-1003',
      nom: 'Tarek Mezghani',
      email: 'adjoint2@edunet.tn',
      telephone: '+216 71 568 201',
      tachesAutorisees: {
        arrivages: true,
        inventaires: false,
        pannesPertes: true,
        comptesLocaux: true,
        rapports: false,
        comptesElissaEdunet: false
      }
    },
    {
      id: 'ADJ-03',
      matricule: 'ADJ-1004',
      nom: 'Rim Bouzidi',
      email: 'adjoint3@edunet.tn',
      telephone: '+216 71 568 202',
      tachesAutorisees: {
        arrivages: false,
        inventaires: true,
        pannesPertes: false,
        comptesLocaux: false,
        rapports: true,
        comptesElissaEdunet: true // Habilitée Elissa & Edunet
      }
    }
  ];

  // Arrivages
  arrivagesList = [
    {
      numero: 'ARR-2026-0042',
      designation: 'Marché National AO-2025-08 Lot 1 : 240 PC Dell & Écrans',
      creCible: 'CRE Manouba',
      etablissement: 'Lycée Ibn Abi Dhiaf',
      quantite: 50,
      fournisseur: 'STE COMPUTER WORLD TUNISIE',
      statut: 'EN_ATTENTE_CONFIRMATIONS',
      confirmations: { sdTic: true, directeur: false, profLabo: false }
    },
    {
      numero: 'ARR-2026-0039',
      designation: 'Marché Connectivité AO-2025-12 : 80 Flybox 4G Secours Bac',
      creCible: 'CRE Tunis',
      etablissement: 'Siège CRE Tunis & Lycées pilotes',
      quantite: 80,
      fournisseur: 'OOREDOO ENTREPRISES',
      statut: 'EN_LITIGE_RESERVE',
      confirmations: { sdTic: true, directeur: true, profLabo: false }
    },
    {
      numero: 'ARR-2026-0035',
      designation: 'Dotation Routeurs Cisco & Switchs 24p Réseau Pédagogique',
      creCible: 'CRE Ariana',
      etablissement: 'Collèges & Lycées',
      quantite: 35,
      fournisseur: 'GLOBAL TELECOM SERVICES',
      statut: 'CONFIRME_FONCTIONNEL',
      confirmations: { sdTic: true, directeur: true, profLabo: true }
    }
  ];

  toastMessage = '';

  constructor(
    private authService: AuthService,
    public comptesService: ComptesDemandesService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.demandesComptes$ = this.comptesService.demandes$;
    
    // Synchroniser la liste des adjoints avec le service
    this.comptesService.adjoints$.subscribe(adjoints => {
      if (adjoints && adjoints.length > 0) {
        this.adjointsList = adjoints.map(a => ({
          id: a.id,
          nom: `${a.prenom} ${a.nom}`,
          email: a.email,
          matricule: a.matricule,
          telephone: a.telephone,
          tachesAutorisees: { ...a.tachesAutorisees }
        }));
      }
    });
  }

  get isAdminCentralTitulaire(): boolean {
    return this.currentUser?.role === 'ADMIN_CENTRAL';
  }

  get myAdjointPermissions(): AdjointManagement | undefined {
    if (this.currentUser?.role === 'ADMIN_ADJOINT') {
      return this.adjointsList.find(a => a.email.toLowerCase() === this.currentUser?.email.toLowerCase()) || this.adjointsList[0];
    }
    return undefined;
  }

  get canManageComptesElissaEdunet(): boolean {
    if (this.isAdminCentralTitulaire) return true;
    return !!this.myAdjointPermissions?.tachesAutorisees.comptesElissaEdunet;
  }

  get myAssignedTasksList(): { label: string; icon: string; key: string }[] {
    if (!this.myAdjointPermissions) return [];
    const t = this.myAdjointPermissions.tachesAutorisees;
    const tasks: { label: string; icon: string; key: string }[] = [];
    if (t.comptesElissaEdunet) tasks.push({ label: 'Comptes Elissa & Edunet', icon: '🔑', key: 'comptesElissaEdunet' });
    if (t.arrivages) tasks.push({ label: 'Arrivages Nationaux', icon: '📦', key: 'arrivages' });
    if (t.inventaires) tasks.push({ label: 'Campagnes d\'Inventaire', icon: '📋', key: 'inventaires' });
    if (t.pannesPertes) tasks.push({ label: 'Pannes & Pertes', icon: '⚠️', key: 'pannesPertes' });
    if (t.comptesLocaux) tasks.push({ label: 'Comptes Locaux CRE', icon: '👥', key: 'comptesLocaux' });
    if (t.rapports) tasks.push({ label: 'Rapports & Exports', icon: '📊', key: 'rapports' });
    return tasks;
  }

  // Filtrage des demandes de comptes transmises au Ministère
  filtrerDemandes(list: DemandeCompteElissaEdunet[] | null): DemandeCompteElissaEdunet[] {
    if (!list) return [];
    return list.filter(d => {
      const matchPlateforme = this.filtrePlateformeCentral === 'TOUS' || d.typePlateforme === this.filtrePlateformeCentral;
      const matchStatut = this.filtreStatutCentral === 'TOUS' || d.statut === this.filtreStatutCentral;
      const matchCre = this.filtreCreDemande === 'TOUS' || d.creOrigine === this.filtreCreDemande;
      return matchPlateforme && matchStatut && matchCre;
    });
  }

  // Approbation et création du compte officiel
  ouvrirModalApprobation(dem: DemandeCompteElissaEdunet): void {
    this.demandeAApprouver = dem;
    const prefix = dem.typePlateforme === 'ELISSA' ? 'elissa_' : 'edunet_';
    const cleanNom = dem.nomDemandeur.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanPrenomInitial = dem.prenomDemandeur.charAt(0).toLowerCase();
    this.idGenere = `${prefix}${cleanPrenomInitial}${cleanNom}_${dem.matricule.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    this.mdpGenere = `TunEdu@${Math.floor(1000 + Math.random() * 9000)}!`;
    this.showModalApprobation = true;
  }

  confirmerCreationCompte(): void {
    if (!this.demandeAApprouver) return;
    if (!this.idGenere.trim() || !this.mdpGenere.trim()) {
      alert('Veuillez renseigner un identifiant et un mot de passe.');
      return;
    }

    this.comptesService.approuverEtGenererCompte(
      this.demandeAApprouver.id,
      this.idGenere,
      this.mdpGenere
    );

    this.showModalApprobation = false;
    this.afficherToast(`✅ Compte officiel ${this.demandeAApprouver.typePlateforme} créé pour ${this.demandeAApprouver.prenomDemandeur} ${this.demandeAApprouver.nomDemandeur} ! Identifiant : ${this.idGenere}`);
    this.demandeAApprouver = null;
  }

  // Rejet d'une demande
  ouvrirModalRejet(dem: DemandeCompteElissaEdunet): void {
    this.demandeARejeter = dem;
    this.motifRejet = 'Pièce justificative illisible ou informations non conformes à l\'arrêté officiel.';
    this.showModalRejet = true;
  }

  confirmerRejet(): void {
    if (!this.demandeARejeter) return;
    if (!this.motifRejet.trim()) {
      alert('Veuillez préciser le motif du rejet.');
      return;
    }

    this.comptesService.rejeterDemande(this.demandeARejeter.id, this.motifRejet);
    this.showModalRejet = false;
    this.afficherToast(`❌ Demande ${this.demandeARejeter.codeDemande} rejetée avec notification au SD-TIC.`);
    this.demandeARejeter = null;
  }

  // Ajout d'un nouveau compte Admin Adjoint (Admin Central)
  ouvrirModalNouvelAdjoint(): void {
    if (!this.isAdminCentralTitulaire) {
      alert('Action réservée à l\'Admin Central titulaire.');
      return;
    }
    const nextIdx = this.adjointsList.length + 1;
    this.formNouvelAdjoint = {
      nom: '',
      prenom: '',
      matricule: `ADJ-${1000 + nextIdx}`,
      email: `adjoint${nextIdx}@edunet.tn`,
      telephone: '+216 71 568 20' + nextIdx,
      taches: {
        arrivages: false,
        inventaires: true,
        pannesPertes: false,
        comptesLocaux: false,
        rapports: true,
        comptesElissaEdunet: true
      }
    };
    this.showModalNouvelAdjoint = true;
  }

  enregistrerNouvelAdjoint(): void {
    if (!this.formNouvelAdjoint.nom.trim() || !this.formNouvelAdjoint.prenom.trim() || !this.formNouvelAdjoint.email.trim()) {
      alert('Veuillez remplir les informations obligatoires de l\'adjoint.');
      return;
    }

    const created = this.comptesService.ajouterAdminAdjoint({
      matricule: this.formNouvelAdjoint.matricule,
      nom: this.formNouvelAdjoint.nom,
      prenom: this.formNouvelAdjoint.prenom,
      email: this.formNouvelAdjoint.email,
      telephone: this.formNouvelAdjoint.telephone,
      tachesAutorisees: { ...this.formNouvelAdjoint.taches }
    });

    this.showModalNouvelAdjoint = false;
    this.afficherToast(`✅ Nouveau compte Admin Adjoint créé : ${created.prenom} ${created.nom} (${created.email}) avec attributions configurées.`);
  }

  // Chiffres consolidés nationaux avec détail précis des équipements en panne
  get totalEquipementsNational(): number {
    return this.creList.reduce((acc, c) => acc + c.totalEquipements, 0);
  }

  get totalEnServiceNational(): number {
    return this.creList.reduce((acc, c) => acc + c.enService, 0);
  }

  get totalEnPanneNational(): number {
    return this.creList.reduce((acc, c) => acc + c.enPanne, 0);
  }

  // DÉTAIL DES ÉQUIPEMENTS EN PANNE AU NIVEAU NATIONAL (PC Fixes, PC Portables, Imprimantes, Réseau)
  get totalPcBureauEnPanneNational(): number {
    return this.creList.reduce((acc, c) => acc + (c.pannesDetail?.pcBureau || 0), 0);
  }

  get totalPcPortableEnPanneNational(): number {
    return this.creList.reduce((acc, c) => acc + (c.pannesDetail?.pcPortable || 0), 0);
  }

  get totalImprimantesEnPanneNational(): number {
    return this.creList.reduce((acc, c) => acc + (c.pannesDetail?.imprimanteScanner || 0), 0);
  }

  get totalReseauEnPanneNational(): number {
    return this.creList.reduce((acc, c) => acc + (c.pannesDetail?.reseauSwitch || 0), 0);
  }

  get totalReclamationsNational(): number {
    return this.creList.reduce((acc, c) => acc + c.reclamationsOuvertes, 0);
  }

  get filteredCreList(): CreSupervision[] {
    return this.creList.filter(c => {
      const matchCre = this.selectedCre === 'TOUS' || c.id === this.selectedCre;
      const matchSearch = !this.searchTerm || 
        c.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        c.sdticNom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        c.gouvernorat.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchCre && matchSearch;
    });
  }

  // ==========================================
  // GESTION DES RESPONSABLES TIC (SD-TIC & DIRECTEURS TIC)
  // Droits Admin Central : Créer, Modifier (MAJ), Supprimer, Activer/Désactiver
  // ==========================================
  ouvrirModalNouveauResponsable(): void {
    if (!this.isAdminCentralTitulaire) {
      alert('Action réservée à l\'Admin Central titulaire.');
      return;
    }
    const nextIdx = this.responsablesTicList.length + 1;
    this.formNouveauResponsable = {
      id: `RESP-${String(nextIdx).padStart(2, '0')}`,
      creId: 'CRE-05',
      creNom: 'CRE Manouba',
      matricule: `TIC-${100 + nextIdx}`,
      nom: '',
      prenom: '',
      roleTitre: 'SD_TIC',
      roleLabel: 'Sous-Directeur TIC',
      email: '',
      telephone: '+216 71 000 000',
      actif: true,
      dateNomination: new Date().toLocaleDateString('fr-FR')
    };
    this.showModalNouveauResponsable = true;
  }

  onCreSelectChange(event: any): void {
    const creId = event.target.value;
    const creFound = this.creList.find(c => c.id === creId);
    if (creFound) {
      this.formNouveauResponsable.creNom = creFound.nom;
      if (!this.formNouveauResponsable.email) {
        const cleanName = creFound.nom.toLowerCase().replace(/[^a-z0-9]/g, '');
        this.formNouveauResponsable.email = `sdtic.${cleanName}@edunet.tn`;
      }
    }
  }

  enregistrerNouveauResponsable(): void {
    if (!this.formNouveauResponsable.nom.trim() || !this.formNouveauResponsable.prenom.trim() || !this.formNouveauResponsable.email.trim()) {
      alert('Veuillez renseigner le nom, prénom et email du responsable TIC.');
      return;
    }

    this.formNouveauResponsable.roleLabel = this.formNouveauResponsable.roleTitre === 'DIRECTEUR_TIC' 
      ? 'Directeur Régional TIC' 
      : 'Sous-Directeur TIC';

    const nouveauResp: ResponsableTicAccount = { ...this.formNouveauResponsable };
    this.responsablesTicList = [nouveauResp, ...this.responsablesTicList];

    // Mettre à jour l'affichage de la CRE cible dans creList
    const cre = this.creList.find(c => c.id === nouveauResp.creId);
    if (cre) {
      cre.sdticNom = `${nouveauResp.prenom} ${nouveauResp.nom} (${this.formNouveauResponsable.roleTitre === 'DIRECTEUR_TIC' ? 'Directeur TIC' : 'SD TIC'})`;
      cre.sdticEmail = nouveauResp.email;
      cre.sdticActif = nouveauResp.actif;
    }

    this.showModalNouveauResponsable = false;
    this.afficherToast(`✅ Compte créé avec succès : ${nouveauResp.prenom} ${nouveauResp.nom} nommé ${nouveauResp.roleLabel} (${nouveauResp.creNom}).`);
  }

  ouvrirModalModifierResponsable(resp: ResponsableTicAccount): void {
    if (!this.isAdminCentralTitulaire) {
      alert('Action réservée à l\'Admin Central titulaire.');
      return;
    }
    this.formModifierResponsable = { ...resp };
    this.showModalModifierResponsable = true;
  }

  enregistrerModificationResponsable(): void {
    if (!this.formModifierResponsable.nom.trim() || !this.formModifierResponsable.email.trim()) {
      alert('Nom et email obligatoires.');
      return;
    }

    this.formModifierResponsable.roleLabel = this.formModifierResponsable.roleTitre === 'DIRECTEUR_TIC' 
      ? 'Directeur Régional TIC' 
      : 'Sous-Directeur TIC';

    const index = this.responsablesTicList.findIndex(r => r.id === this.formModifierResponsable.id);
    if (index !== -1) {
      this.responsablesTicList[index] = { ...this.formModifierResponsable };
      
      // Sync avec creList
      const cre = this.creList.find(c => c.id === this.formModifierResponsable.creId);
      if (cre) {
        cre.sdticNom = `${this.formModifierResponsable.prenom} ${this.formModifierResponsable.nom} (${this.formModifierResponsable.roleTitre === 'DIRECTEUR_TIC' ? 'Directeur TIC' : 'SD TIC'})`;
        cre.sdticEmail = this.formModifierResponsable.email;
        cre.sdticActif = this.formModifierResponsable.actif;
      }
    }

    this.showModalModifierResponsable = false;
    this.afficherToast(`✅ Modifications enregistrées pour ${this.formModifierResponsable.prenom} ${this.formModifierResponsable.nom} (${this.formModifierResponsable.creNom}).`);
  }

  supprimerResponsableTic(resp: ResponsableTicAccount): void {
    if (!this.isAdminCentralTitulaire) {
      alert('Action réservée à l\'Admin Central titulaire.');
      return;
    }
    if (confirm(`Confirmez-vous la suppression du compte de ${resp.prenom} ${resp.nom} (${resp.roleLabel} - ${resp.creNom}) ?`)) {
      this.responsablesTicList = this.responsablesTicList.filter(r => r.id !== resp.id);
      
      const cre = this.creList.find(c => c.id === resp.creId);
      if (cre) {
        cre.sdticNom = 'Poste Vacant (En attente nomination)';
        cre.sdticEmail = 'vacant@edunet.tn';
        cre.sdticActif = false;
      }
      this.afficherToast(`🗑️ Compte de ${resp.prenom} ${resp.nom} supprimé avec succès.`);
    }
  }

  toggleResponsableTicStatut(resp: ResponsableTicAccount): void {
    if (!this.isAdminCentralTitulaire) {
      alert('Action réservée à l\'Admin Central titulaire.');
      return;
    }
    resp.actif = !resp.actif;
    const cre = this.creList.find(c => c.id === resp.creId);
    if (cre) {
      cre.sdticActif = resp.actif;
    }
    const etat = resp.actif ? 'réactivé' : 'suspendu';
    this.afficherToast(`Compte de ${resp.prenom} ${resp.nom} (${resp.creNom}) ${etat}.`);
  }

  // ==========================================
  // GESTION DES ADMIN ADJOINTS
  // Droits Admin Central : Créer, Modifier (MAJ), Supprimer, Activer/Désactiver
  // ==========================================
  ouvrirModalModifierAdjoint(adj: AdjointManagement): void {
    if (!this.isAdminCentralTitulaire) {
      alert('Action strictement interdite : Seul l\'Admin Central titulaire peut modifier un compte adjoint.');
      return;
    }
    this.formModifierAdjoint = {
      id: adj.id,
      matricule: adj.matricule || '',
      nom: adj.nom,
      email: adj.email,
      telephone: adj.telephone || '',
      actif: adj.actif !== false,
      tachesAutorisees: { ...adj.tachesAutorisees }
    };
    this.showModalModifierAdjoint = true;
  }

  enregistrerModificationAdjoint(): void {
    if (!this.formModifierAdjoint.nom.trim() || !this.formModifierAdjoint.email.trim()) {
      alert('Nom et email obligatoires.');
      return;
    }

    const index = this.adjointsList.findIndex(a => a.id === this.formModifierAdjoint.id);
    if (index !== -1) {
      this.adjointsList[index] = { ...this.formModifierAdjoint };
      this.comptesService.modifierAdminAdjoint(this.formModifierAdjoint.id, {
        matricule: this.formModifierAdjoint.matricule,
        nom: this.formModifierAdjoint.nom,
        email: this.formModifierAdjoint.email,
        telephone: this.formModifierAdjoint.telephone,
        actif: this.formModifierAdjoint.actif,
        tachesAutorisees: this.formModifierAdjoint.tachesAutorisees
      });
    }

    this.showModalModifierAdjoint = false;
    this.afficherToast(`✅ Compte et habilitations de l'Adjoint ${this.formModifierAdjoint.nom} mis à jour avec succès.`);
  }

  supprimerAdjoint(adj: AdjointManagement): void {
    if (!this.isAdminCentralTitulaire) {
      alert('Action réservée à l\'Admin Central titulaire.');
      return;
    }
    if (confirm(`Confirmez-vous la suppression définitive du compte de l'Admin Adjoint ${adj.nom} (${adj.email}) ?`)) {
      this.adjointsList = this.adjointsList.filter(a => a.id !== adj.id);
      this.comptesService.supprimerAdminAdjoint(adj.id);
      this.afficherToast(`🗑️ Compte de l'adjoint ${adj.nom} supprimé du système.`);
    }
  }

  toggleAdjointStatut(adj: AdjointManagement): void {
    if (!this.isAdminCentralTitulaire) {
      alert('Action réservée à l\'Admin Central titulaire.');
      return;
    }
    adj.actif = adj.actif === undefined ? false : !adj.actif;
    this.comptesService.toggleAdminAdjointStatut(adj.id);
    const etat = adj.actif ? 'activé' : 'désactivé';
    this.afficherToast(`Compte de l'adjoint ${adj.nom} ${etat}.`);
  }

  // Seul l'Admin Central titulaire peut modifier/autoriser/interdire les tâches des adjoints
  togglePermission(adj: AdjointManagement, task: keyof AdjointManagement['tachesAutorisees']): void {
    if (!this.isAdminCentralTitulaire) {
      alert('Action strictement interdite : Seul l\'Admin Central titulaire peut affecter ou interdire des tâches. Un adjoint ne peut en aucun cas modifier ses propres attributions.');
      return;
    }
    adj.tachesAutorisees[task] = !adj.tachesAutorisees[task];
    this.comptesService.modifierTachesAdjoint(adj.id, adj.tachesAutorisees);
    const etat = adj.tachesAutorisees[task] ? 'autorisée' : 'interdite';
    this.afficherToast(`Habilitation « ${task} » ${etat} pour l'adjoint ${adj.nom}.`);
  }

  toggleSdTicStatus(cre: CreSupervision): void {
    if (!this.isAdminCentralTitulaire) {
      alert('Action réservée à l\'Admin Central titulaire : Seul l\'Admin Central peut activer ou suspendre les responsables de CRE.');
      return;
    }
    cre.sdticActif = !cre.sdticActif;
    const resp = this.responsablesTicList.find(r => r.creId === cre.id);
    if (resp) {
      resp.actif = cre.sdticActif;
    }
    const etat = cre.sdticActif ? 'activé' : 'suspendu';
    this.afficherToast(`Compte de ${cre.sdticNom} ${etat}.`);
  }

  afficherToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => this.toastMessage = '', 4500);
  }
}

