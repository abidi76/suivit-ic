import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserAccount } from '../../core/services/auth.service';
import { 
  ComptesDemandesService, 
  DemandeCompteElissaEdunet, 
  PersonnelCreRecord, 
  AdminAdjointCompte 
} from '../../core/services/comptes-demandes.service';
import { Observable } from 'rxjs';
import { FirebaseService, firebaseConfig } from '../../core/services/firebase.service';

export interface DeviceTypeStat {
  type: string;
  total: number;
  enService: number;
  enPanne: number;
  enAttente: number;
  icon: string;
}

export interface EtablissementCre {
  id: string;
  nom: string;
  typeCategorie: 'ECOLE_PRIMAIRE' | 'COLLEGE' | 'COLLEGE_TECHNIQUE' | 'LYCEE' | 'CENTRAL_CRE';
  categorieLabel: string;
  delegation: string;
  total: number;
  enService: number;
  enPanne: number;
  enAttente: number;
  directeurNom: string;
  circuitStatut: 'FIBRE_OK' | 'FLYBOX_SECOURS' | 'COUPURE';
  // Surveillance Sonde Réseau & Débit Internet (IP Publique)
  ipPublique: string;
  fai: string;
  debitDescendant: number; // Mbps
  debitMontant: number; // Mbps
  latenceMs: number; // ms
  pertePaquetsPct: number; // %
  dernierPaquetRecu: string;
  historiquePaquets: ('RECU' | 'PERDU')[];
  alerteAutomatiqueSonde?: string;
  // Détail pannes par type d'équipement
  pannesDetail: {
    pcBureau: number;
    pcPortable: number;
    imprimanteScanner: number;
    reseauSwitch: number;
  };
}

export interface CompteLocal {
  id: string;
  matricule: string;
  nom: string;
  roleLocal: 'DIRECTEUR' | 'TECHNICIEN_INTERNE' | 'TECHNICIEN_PRESTATAIRE' | 'PROF' | 'AGENT_ADMIN' | 'SECRETAIRE_GENERAL' | 'RESPONSABLE_EXAMEN' | 'INSPECTEUR' | 'SD_BATIMENTS';
  roleLabel: string;
  etablissement: string;
  email: string;
  actif: boolean;
}

export interface FluxEmprunt {
  id: string;
  emprunteurNom: string;
  preteurNom: string;
  materiel: string;
  quantite: number;
  motif: string;
  periode: string;
  etapeFlux: 'DEMANDE_INITIEE' | 'ACCORD_PRETEUR' | 'VALIDE_TRANSFERT_SDTIC' | 'RECU_PAR_EMPRUNTEUR' | 'RESTITUTION_VALIDEE';
  etapeLabel: string;
  dateCreation: string;
}

export interface OrdreMissionDemande {
  id: string;
  omNumero: string;
  etablissement: string;
  technicienNom: string;
  motifMission: string;
  dateDemandee: string;
  equipementsConcernes?: string;
  // Circuit avec le SD-Bâtiments
  statutBatiments: 'EN_ATTENTE_SD_BATIMENTS' | 'VALIDE_AVEC_VEHICULE' | 'AJOURNE_REPORTE';
  vehiculeAffecte?: string;
  chauffeurAffecte?: string;
  dateAjournee?: string;
  motifAjournement?: string;
}

export interface PlanningItem {
  id: string;
  tache: string;
  technicien: string;
  date: string;
  etablissement: string;
  action: string;
  equipementsConcernes?: string;
  priorite: 'URGENTE' | 'NORMALE';
  statut: 'PLANIFIE' | 'EN_COURS' | 'CLOTURE';
}

export interface AgentAdminRecord {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  direction: string;
  service: string;
  bureau: string;
  localisation: 'Siège Central CRE' | 'CREFOC Manouba' | 'Lycée Ibn Abi Dhiaf';
  ipFixe: string;
  vlan: string;
  priseMurale: string;
  equipementsDotation: { type: string; marque: string; sn: string }[];
  tachesDeleguees: string[];
}

export interface PrestataireInterventionSupervision {
  code: string;
  societe: string;
  technicien: string;
  etablissement: string;
  datePrevue: string;
  statut: 'RESERVEE_DIRECTEUR' | 'ATTENTE_VALIDATION_DIRECTEUR' | 'VALIDEE_DIRECTEUR';
  statutLabel: string;
  equipementsServis: string;
  dispenseOmVoiture: true;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: any = null;
  isLoading = true;
  currentUser: UserAccount | null = null;
  activeTab: 'supervision' | 'demandes-comptes' | 'comptes-locaux' | 'agents-admin' | 'prestataires' | 'flux-emprunts' | 'ordres-mission' | 'planning' | 'sonde-reseau' = 'supervision';

  // Observables des demandes de comptes Elissa & Edunet et des Adjoints
  demandesComptes$!: Observable<DemandeCompteElissaEdunet[]>;
  adjointsHabilites$!: Observable<AdminAdjointCompte[]>;

  // Formulaire Nouvelle Demande de Compte Elissa / Edunet
  showModalDemandeCompte = false;
  formDemandeCompte = {
    selectedPersonnelMatricule: '',
    typePlateforme: 'ELISSA' as 'ELISSA' | 'EDUNET',
    matricule: '',
    cin: '',
    nomDemandeur: '',
    prenomDemandeur: '',
    emailDemandeur: '',
    telephoneDemandeur: '',
    etablissementOuSiege: '',
    // Champs spécifiques Elissa
    tacheActuelle: '',
    tachePrecedente: '',
    lieuPrecedent: '',
    chefDirectActuel: '',
    // Champs spécifiques Edunet
    roleEdunetDemande: 'Enseignant / Responsable Pédagogique',
    // 2 Pièces jointes obligatoires pour Elissa
    pieceJointeCinNom: 'Copie_CIN_Scan_Signee.pdf',
    pieceJointeArreteNom: 'Arrete_Nomination_PV_Installation.pdf'
  };

  // Modal d'acheminement de la demande vers un Admin Adjoint ministériel
  showModalAcheminement = false;
  selectedDemandeForAcheminement: DemandeCompteElissaEdunet | null = null;
  selectedAdjointId = 'ADJ-01';

  // Filtre demandes de comptes
  filtreTypeCompte: 'TOUS' | 'ELISSA' | 'EDUNET' = 'TOUS';
  filtreStatutCompte: string = 'TOUS';

  // Liste des 26 Commissariats Régionaux de l'Éducation (CRE) de la République Tunisienne
  listeCre26: string[] = [
    'CRE Tunis 1', 'CRE Tunis 2', 'CRE Ariana', 'CRE Ben Arous', 'CRE Manouba',
    'CRE Nabeul', 'CRE Zaghouan', 'CRE Bizerte', 'CRE Béja', 'CRE Jendouba',
    'CRE Le Kef', 'CRE Siliana', 'CRE Sousse', 'CRE Monastir', 'CRE Mahdia',
    'CRE Sfax 1', 'CRE Sfax 2', 'CRE Kairouan', 'CRE Kasserine', 'CRE Sidi Bouzid',
    'CRE Gafsa', 'CRE Tozeur', 'CRE Kébili', 'CRE Gabès', 'CRE Médenine', 'CRE Tataouine'
  ];
  selectedCreNom: string = 'CRE Manouba';

  // Filtres Supervision CRE
  selectedCategorie: string = 'TOUTES';
  selectedDelegation: string = 'TOUTES';
  searchTerm: string = '';

  // 1. Liste des Établissements de la CRE sélectionnée avec Surveillance Réseau par IP Publique & Détail Pannes
  etablissementsCre: EtablissementCre[] = [
    {
      id: 'CRE-SIEGE',
      nom: 'Siège Central CRE Manouba (Administration & Parc Auto)',
      typeCategorie: 'CENTRAL_CRE',
      categorieLabel: 'Siège CRE',
      delegation: 'Manouba',
      total: 45,
      enService: 43,
      enPanne: 2,
      enAttente: 0,
      directeurNom: 'Direction CRE Manouba',
      circuitStatut: 'FIBRE_OK',
      ipPublique: '197.14.88.10',
      fai: 'Tunisie Télécom (Fibre Dédiée)',
      debitDescendant: 100.0,
      debitMontant: 50.0,
      latenceMs: 14,
      pertePaquetsPct: 0,
      dernierPaquetRecu: '10:42:15',
      historiquePaquets: ['RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU'],
      pannesDetail: { pcBureau: 1, pcPortable: 0, imprimanteScanner: 1, reseauSwitch: 0 }
    },
    {
      id: 'LYC-01',
      nom: 'Lycée Ibn Abi Dhiaf',
      typeCategorie: 'LYCEE',
      categorieLabel: 'Lycée Secondaire',
      delegation: 'Manouba',
      total: 84,
      enService: 74,
      enPanne: 6,
      enAttente: 4,
      directeurNom: 'M. Moncef Ben Salem',
      circuitStatut: 'FIBRE_OK',
      ipPublique: '197.14.88.22',
      fai: 'Tunisie Télécom (Fibre Pro)',
      debitDescendant: 50.2,
      debitMontant: 20.1,
      latenceMs: 18,
      pertePaquetsPct: 0,
      dernierPaquetRecu: '10:42:15',
      historiquePaquets: ['RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU'],
      pannesDetail: { pcBureau: 3, pcPortable: 1, imprimanteScanner: 1, reseauSwitch: 1 }
    },
    {
      id: 'COL-01',
      nom: 'Collège Pilote Manouba',
      typeCategorie: 'COLLEGE',
      categorieLabel: 'Collège d\'Enseignement Général',
      delegation: 'Manouba',
      total: 52,
      enService: 48,
      enPanne: 2,
      enAttente: 2,
      directeurNom: 'Mme Sonia Mejri',
      circuitStatut: 'FIBRE_OK',
      ipPublique: '197.14.88.35',
      fai: 'Tunisie Télécom (Fibre Pro)',
      debitDescendant: 49.8,
      debitMontant: 19.5,
      latenceMs: 16,
      pertePaquetsPct: 0,
      dernierPaquetRecu: '10:42:15',
      historiquePaquets: ['RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU'],
      pannesDetail: { pcBureau: 1, pcPortable: 1, imprimanteScanner: 0, reseauSwitch: 0 }
    },
    {
      id: 'COL-TECH-01',
      nom: 'Collège Technique & Professionnel Oued Ellil',
      typeCategorie: 'COLLEGE_TECHNIQUE',
      categorieLabel: 'Collège Technique',
      delegation: 'Oued Ellil',
      total: 65,
      enService: 58,
      enPanne: 5,
      enAttente: 2,
      directeurNom: 'M. Ridha Mabrouk',
      circuitStatut: 'FLYBOX_SECOURS',
      ipPublique: '197.14.90.14',
      fai: 'Orange Tunisie (Flybox 4G Pro)',
      debitDescendant: 18.4,
      debitMontant: 5.8,
      latenceMs: 42,
      pertePaquetsPct: 10,
      dernierPaquetRecu: '10:42:15',
      historiquePaquets: ['RECU', 'RECU', 'RECU', 'PERDU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU'],
      alerteAutomatiqueSonde: '⚠️ Connexion basculée sur Flybox 4G de secours',
      pannesDetail: { pcBureau: 2, pcPortable: 1, imprimanteScanner: 1, reseauSwitch: 1 }
    },
    {
      id: 'LYC-02',
      nom: 'Lycée Asad Ibn Al Fourat',
      typeCategorie: 'LYCEE',
      categorieLabel: 'Lycée Secondaire',
      delegation: 'Oued Ellil',
      total: 68,
      enService: 56,
      enPanne: 8,
      enAttente: 4,
      directeurNom: 'M. Tarek Hamdi',
      circuitStatut: 'FLYBOX_SECOURS',
      ipPublique: '197.14.90.48',
      fai: 'Ooredoo Tunisie (Flybox Pro)',
      debitDescendant: 16.2,
      debitMontant: 5.1,
      latenceMs: 45,
      pertePaquetsPct: 0,
      dernierPaquetRecu: '10:42:15',
      historiquePaquets: ['RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU'],
      alerteAutomatiqueSonde: '⚠️ Débit réduit sur lien 4G de secours',
      pannesDetail: { pcBureau: 4, pcPortable: 2, imprimanteScanner: 1, reseauSwitch: 1 }
    },
    {
      id: 'PRI-01',
      nom: 'École Primaire Habib Bourguiba - Manouba',
      typeCategorie: 'ECOLE_PRIMAIRE',
      categorieLabel: 'École Primaire',
      delegation: 'Manouba',
      total: 22,
      enService: 20,
      enPanne: 2,
      enAttente: 0,
      directeurNom: 'Mme Latifa Riahi',
      circuitStatut: 'FIBRE_OK',
      ipPublique: '197.14.88.75',
      fai: 'Tunisie Télécom (VDSL Pro)',
      debitDescendant: 30.5,
      debitMontant: 10.2,
      latenceMs: 22,
      pertePaquetsPct: 0,
      dernierPaquetRecu: '10:42:15',
      historiquePaquets: ['RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU'],
      pannesDetail: { pcBureau: 1, pcPortable: 0, imprimanteScanner: 1, reseauSwitch: 0 }
    },
    {
      id: 'PRI-02',
      nom: 'École Primaire 2 Mars - Mornaguia',
      typeCategorie: 'ECOLE_PRIMAIRE',
      categorieLabel: 'École Primaire',
      delegation: 'Mornaguia',
      total: 18,
      enService: 17,
      enPanne: 1,
      enAttente: 0,
      directeurNom: 'M. Naceur Dridi',
      circuitStatut: 'FLYBOX_SECOURS',
      ipPublique: '197.14.90.89',
      fai: 'Tunisie Télécom (Flybox Pro)',
      debitDescendant: 14.8,
      debitMontant: 4.2,
      latenceMs: 51,
      pertePaquetsPct: 0,
      dernierPaquetRecu: '10:42:15',
      historiquePaquets: ['RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU', 'RECU'],
      pannesDetail: { pcBureau: 1, pcPortable: 0, imprimanteScanner: 0, reseauSwitch: 0 }
    },
    {
      id: 'LYC-03',
      nom: 'Lycée Borj El Amri',
      typeCategorie: 'LYCEE',
      categorieLabel: 'Lycée Secondaire',
      delegation: 'Borj El Amri',
      total: 42,
      enService: 36,
      enPanne: 4,
      enAttente: 2,
      directeurNom: 'M. Belhassen Riahi',
      circuitStatut: 'COUPURE',
      ipPublique: '197.14.99.102',
      fai: 'Tunisie Télécom (Fibre rompue)',
      debitDescendant: 0,
      debitMontant: 0,
      latenceMs: 0,
      pertePaquetsPct: 100,
      dernierPaquetRecu: '09:15:00',
      historiquePaquets: ['PERDU', 'PERDU', 'PERDU', 'PERDU', 'PERDU', 'PERDU', 'PERDU', 'PERDU', 'PERDU', 'PERDU'],
      alerteAutomatiqueSonde: '🚨 Coupure totale détectée par la sonde IP (0 paquet reçu)',
      pannesDetail: { pcBureau: 2, pcPortable: 1, imprimanteScanner: 1, reseauSwitch: 0 }
    }
  ];

  // 2. Gestion des Comptes Locaux de la CRE
  comptesLocaux: CompteLocal[] = [
    { id: 'U-01', matricule: 'DIR-1101', nom: 'Moncef Ben Salem', roleLocal: 'DIRECTEUR', roleLabel: 'Directeur Établissement', etablissement: 'Lycée Ibn Abi Dhiaf', email: 'directeur.ibnabidhiaf@edunet.tn', actif: true },
    { id: 'U-02', matricule: 'TEC-2101', nom: 'Sami Khelifi', roleLocal: 'TECHNICIEN_INTERNE', roleLabel: 'Technicien Interne CRE', etablissement: 'Siège CRE Manouba', email: 'tech.khelifi@edunet.tn', actif: true },
    { id: 'U-03', matricule: 'TEC-2102', nom: 'Société MICRO-TECH', roleLocal: 'TECHNICIEN_PRESTATAIRE', roleLabel: 'Technicien Prestataire (AO-2025-04)', etablissement: 'Mandaté CRE Manouba', email: 'maintenance@microtech.tn', actif: true },
    { id: 'U-04', matricule: 'SDB-3101', nom: 'Hédi Baccouche', roleLocal: 'SD_BATIMENTS', roleLabel: 'Sous-Directeur Bâtiments & Parc Auto', etablissement: 'Siège CRE Manouba', email: 'sd.batiments.manouba@edunet.tn', actif: true },
    { id: 'U-05', matricule: 'INS-4101', nom: 'Pr. Mustapha Zribi', roleLocal: 'INSPECTEUR', roleLabel: 'Inspecteur Pédagogique TIC', etablissement: 'Région Manouba', email: 'inspecteur.tic.manouba@edunet.tn', actif: true },
    { id: 'U-06', matricule: 'SEC-5101', nom: 'Zouhair Mansour', roleLocal: 'SECRETAIRE_GENERAL', roleLabel: 'Secrétaire Général de la CRE', etablissement: 'Siège CRE Manouba', email: 'sg.manouba@edunet.tn', actif: true },
    { id: 'U-07', matricule: 'EXA-6101', nom: 'Chokri Trabelsi', roleLocal: 'RESPONSABLE_EXAMEN', roleLabel: 'Responsable Examens Régionaux (Bac)', etablissement: 'Siège CRE Manouba', email: 'examens.manouba@edunet.tn', actif: true },
    { id: 'U-08', matricule: 'ADM-7101', nom: 'Najla Ben Abdallah', roleLocal: 'AGENT_ADMIN', roleLabel: 'Agent Administratif TIC', etablissement: 'Siège CRE Manouba', email: 'agent.tic.manouba@edunet.tn', actif: true },
    { id: 'U-09', matricule: 'PRF-8101', nom: 'Sami Mansour', roleLocal: 'PROF', roleLabel: 'Professeur Responsable Labo 1', etablissement: 'Lycée Ibn Abi Dhiaf', email: 'prof.sami@edunet.tn', actif: true }
  ];

  // 2b. Annuaire et gestion des Agents Administratifs pré-saisis par le SD-TIC
  // RÈGLE MINISTÉRIELLE : Seuls les agents affectés à la Direction TIC peuvent être délégués pour certaines tâches par le SD-TIC.
  agentsAdminList: AgentAdminRecord[] = [
    {
      id: 'ADM-01',
      matricule: 'ADM-7101',
      nom: 'Ben Abdallah',
      prenom: 'Najla',
      direction: 'Direction Régionale TIC & Systèmes d\'Information',
      service: 'Service Exploitation, Support & Parc Informatique',
      bureau: 'Bureau TIC 14 (Aile Technique)',
      localisation: 'Siège Central CRE',
      ipFixe: '192.168.10.45',
      vlan: 'VLAN 10 - Admin CRE',
      priseMurale: 'PRISE-RJ45-B14-02',
      equipementsDotation: [
        { type: 'PC Bureau', marque: 'HP ProDesk 400 G7', sn: 'SN-HP-PD400-994102' },
        { type: 'Écran', marque: 'HP EliteDisplay 24"', sn: 'SN-HP-SCR24-338190' },
        { type: 'Imprimante', marque: 'HP LaserJet MFP M428', sn: 'SN-HP-MFP428-771204' }
      ],
      tachesDeleguees: [
        'Inventaire trimestriel des postes informatiques administratifs',
        'Pointage et assistance des techniciens prestataires externes'
      ]
    },
    {
      id: 'ADM-04',
      matricule: 'ADM-7104',
      nom: 'Chaouachi',
      prenom: 'Farouk',
      direction: 'Direction Régionale TIC & Systèmes d\'Information',
      service: 'Service Réseaux, Télécoms & Connectivité des Établissements',
      bureau: 'Bureau TIC 03',
      localisation: 'Siège Central CRE',
      ipFixe: '192.168.10.48',
      vlan: 'VLAN 10 - Admin CRE',
      priseMurale: 'PRISE-RJ45-B03-01',
      equipementsDotation: [
        { type: 'PC Portable', marque: 'Dell Latitude 5420', sn: 'SN-DELL-LAT-551980' },
        { type: 'Écran', marque: 'Dell UltraSharp 24"', sn: 'SN-DELL-SCR-9901' }
      ],
      tachesDeleguees: [
        'Supervision des paquets des sondes IP des établissements scolaires',
        'Réception des fiches de tests de débits internet FAI'
      ]
    },
    {
      id: 'ADM-02',
      matricule: 'ADM-7105',
      nom: 'Dridi',
      prenom: 'Mounir',
      direction: 'Direction Régionale de la Formation Continue (CREFOC)',
      service: 'Service Logistique & Accueil Stagiaires',
      bureau: 'Secrétariat CREFOC',
      localisation: 'CREFOC Manouba',
      ipFixe: '192.168.20.12',
      vlan: 'VLAN 20 - CREFOC',
      priseMurale: 'PRISE-RJ45-CF-01',
      equipementsDotation: [
        { type: 'PC Bureau', marque: 'Dell OptiPlex 3070', sn: 'SN-DELL-3070-551120' },
        { type: 'Imprimante', marque: 'Canon i-Sensys LBP223', sn: 'SN-CANON-88419' }
      ],
      tachesDeleguees: []
    },
    {
      id: 'ADM-03',
      matricule: 'ADM-7109',
      nom: 'Kefi',
      prenom: 'Salma',
      direction: 'Administration Lycée Ibn Abi Dhiaf',
      service: 'Secrétariat des Élèves & Inscriptions',
      bureau: 'Bureau Administration Scolaire',
      localisation: 'Lycée Ibn Abi Dhiaf',
      ipFixe: '192.168.30.88',
      vlan: 'VLAN 30 - Lycée',
      priseMurale: 'PRISE-RJ45-LYC-B03',
      equipementsDotation: [
        { type: 'PC Bureau', marque: 'Lenovo ThinkCentre M720', sn: 'SN-LNV-M720-4491' },
        { type: 'Écran', marque: 'Lenovo 22"', sn: 'SN-LNV-SCR-1190' }
      ],
      tachesDeleguees: []
    }
  ];

  // 2c. Interventions des Prestataires Extérieurs supervisées par le SD-TIC
  prestatairesSupervisionList: PrestataireInterventionSupervision[] = [
    {
      code: 'PREST-2026-0038',
      societe: 'Société MICRO-TECH',
      technicien: 'Karim Jaziri',
      etablissement: 'Lycée Ibn Abi Dhiaf (Manouba)',
      datePrevue: '27/10/2026',
      statut: 'ATTENTE_VALIDATION_DIRECTEUR',
      statutLabel: 'En attente de validation du Directeur',
      equipementsServis: '3 PC Dell (S/N: 883921, 883922) + 1 Écran (S/N: 4401)',
      dispenseOmVoiture: true
    },
    {
      code: 'PREST-2026-0041',
      societe: 'Société MICRO-TECH',
      technicien: 'Karim Jaziri',
      etablissement: 'Lycée Asad Ibn Al Fourat (Oued Ellil)',
      datePrevue: '28/10/2026',
      statut: 'RESERVEE_DIRECTEUR',
      statutLabel: 'Réservée avec le Directeur (Sans OM / Moyen propre)',
      equipementsServis: 'Lot PC multimédia pour maintenance semestrielle',
      dispenseOmVoiture: true
    },
    {
      code: 'PREST-2026-0029',
      societe: 'Société MICRO-TECH',
      technicien: 'Karim Jaziri',
      etablissement: 'Collège Pilote Manouba',
      datePrevue: '20/10/2026',
      statut: 'VALIDEE_DIRECTEUR',
      statutLabel: 'Validée & Visée par la Directrice d\'établissement',
      equipementsServis: 'Imprimante HP Laser (S/N: 9910) - Rouleaux changés',
      dispenseOmVoiture: true
    }
  ];

  // Modal Délégation de Tâche SD-TIC vers un Agent Administratif
  showDelegationModal = false;
  selectedAgentForDelegation: AgentAdminRecord | null = null;
  nouvelleTacheTexte = '';

  ouvrirDelegationTache(agent: AgentAdminRecord): void {
    this.selectedAgentForDelegation = agent;
    this.nouvelleTacheTexte = '';
    this.showDelegationModal = true;
  }

  confirmerDelegationTache(): void {
    if (!this.selectedAgentForDelegation || !this.nouvelleTacheTexte.trim()) return;
    this.selectedAgentForDelegation.tachesDeleguees.push(this.nouvelleTacheTexte.trim());
    this.afficherToast(`✅ Mission déléguée avec succès à ${this.selectedAgentForDelegation.prenom} ${this.selectedAgentForDelegation.nom} (${this.selectedAgentForDelegation.matricule}).`);
    this.showDelegationModal = false;
  }

  // 3. Flux des Emprunts (Circuit complet supervisé par le SD TIC)
  fluxEmprunts: FluxEmprunt[] = [
    {
      id: 'FLX-2026-001',
      emprunteurNom: 'Lycée Asad Ibn Al Fourat (Oued Ellil)',
      preteurNom: 'Lycée Ibn Abi Dhiaf (Manouba)',
      materiel: '10 PC Fixes Dell Optiplex + 1 Flybox 4G Pro',
      quantite: 11,
      motif: 'Préparation Salle C2 Bac Pratique 2026',
      periode: '15 Mai 2026 au 30 Mai 2026',
      etapeFlux: 'ACCORD_PRETEUR',
      etapeLabel: 'Accord du directeur prêteur reçu · En attente validation SD TIC',
      dateCreation: '2026-10-25'
    },
    {
      id: 'FLX-2026-002',
      emprunteurNom: 'Collège Technique Oued Ellil',
      preteurNom: 'Collège Pilote Manouba',
      materiel: '1 Switch Cisco 24 ports Gigabit',
      quantite: 1,
      motif: 'Renfort réseau examen technique',
      periode: '01 Nov 2026 au 15 Nov 2026',
      etapeFlux: 'VALIDE_TRANSFERT_SDTIC',
      etapeLabel: 'Transfert validé par le SD TIC · En cours de livraison',
      dateCreation: '2026-10-24'
    },
    {
      id: 'FLX-2026-003',
      emprunteurNom: 'Lycée Mornaguia',
      preteurNom: 'Lycée Borj El Amri',
      materiel: '2 Flybox 4G Ooredoo secours',
      quantite: 2,
      motif: 'Coupure ligne internet principale',
      periode: 'Octobre 2026',
      etapeFlux: 'RECU_PAR_EMPRUNTEUR',
      etapeLabel: 'Matériel en service chez l\'emprunteur · En attente procédure de restitution',
      dateCreation: '2026-10-20'
    }
  ];

  // 4. Ordres de Mission & Demandes de Voitures (Interaction SD TIC & SD-Bâtiments)
  ordresMissionList: OrdreMissionDemande[] = [
    {
      id: 'OM-REQ-01',
      omNumero: 'OM-2026-0188',
      etablissement: 'Lycée Asad Ibn Al Fourat (Oued Ellil)',
      technicienNom: 'Sami Khelifi',
      motifMission: 'Dépannage d\'urgence 5 postes informatiques Bac Pratique',
      equipementsConcernes: 'Lot de 5 PC Dell OptiPlex 3080 (SN: SN-DELL-883921 à 883925)',
      dateDemandee: '2026-10-27 08:30',
      statutBatiments: 'VALIDE_AVEC_VEHICULE',
      vehiculeAffecte: 'Peugeot Partner (204 TU 1150)',
      chauffeurAffecte: 'Amor Trabelsi'
    },
    {
      id: 'OM-REQ-02',
      omNumero: 'OM-2026-0192',
      etablissement: 'Lycée Ibn Abi Dhiaf (Manouba)',
      technicienNom: 'Sami Khelifi',
      motifMission: 'Remplacement écrans labo 2 suite coupure électrique',
      equipementsConcernes: 'Lot de 5 Écrans Dell 24" (SN: SN-SCR-4401 à 4405)',
      dateDemandee: '2026-10-28 09:00',
      statutBatiments: 'EN_ATTENTE_SD_BATIMENTS'
    },
    {
      id: 'OM-REQ-03',
      omNumero: 'OM-2026-0179',
      etablissement: 'Collège Technique Oued Ellil',
      technicienNom: 'Équipe Réseau Externe',
      motifMission: 'Inspection ligne Fibre optique et jarretière',
      equipementsConcernes: 'Routeur Fibre Edunet & Jarretière (CIRCUIT-TT-8841)',
      dateDemandee: '2026-10-26 14:00',
      statutBatiments: 'AJOURNE_REPORTE',
      dateAjournee: '2026-10-29 09:30',
      motifAjournement: 'Véhicules tous mobilisés pour la distribution des épreuves de contrôle.'
    }
  ];

  // 5. Planning Opérationnel fait par le SD TIC
  planningList: PlanningItem[] = [
    {
      id: 'PLN-01',
      tache: 'Remplacement alimentation postes labo 1',
      technicien: 'Sami Khelifi (Tech Interne)',
      date: 'Mardi 27 Oct 09:00',
      etablissement: 'Lycée Asad Ibn Al Fourat',
      action: 'Changement bloc alimentation ATX + test tension',
      equipementsConcernes: 'PC Dell OptiPlex 3080 (SN-DELL-883921)',
      priorite: 'URGENTE',
      statut: 'PLANIFIE'
    },
    {
      id: 'PLN-02',
      tache: 'Masterisation & Formatage Bac Pratique',
      technicien: 'Sami Khelifi & Prof Responsable',
      date: 'Mercredi 28 Oct 08:30',
      etablissement: 'Lycée Ibn Abi Dhiaf',
      action: 'Déploiement image Windows 11 + Python 3.11 + MySQL',
      equipementsConcernes: '24 Postes PC Dell (SN-DELL-3080-01 à 24)',
      priorite: 'URGENTE',
      statut: 'PLANIFIE'
    },
    {
      id: 'PLN-03',
      tache: 'Maintenance préventive parc imprimantes',
      technicien: 'Société MICRO-TECH (Prestataire)',
      date: 'Jeudi 29 Oct 10:00',
      etablissement: 'Collège Pilote Manouba',
      action: 'Nettoyage têtes laser et galets d\'entraînement',
      equipementsConcernes: '2 Imprimantes HP LaserJet M404n (SN-HP-M404-01, 02)',
      priorite: 'NORMALE',
      statut: 'PLANIFIE'
    },
    {
      id: 'PLN-04',
      tache: 'Câblage baie de brassage et switch 24p',
      technicien: 'Karim Bouazizi (Ingénieur Réseau)',
      date: 'Vendredi 30 Oct 14:00',
      etablissement: 'Lycée Mornaguia',
      action: 'Reconfiguration VLAN salle des professeurs',
      equipementsConcernes: 'Switch Cisco Catalyst 2960 (SN-CSCO-992144)',
      priorite: 'NORMALE',
      statut: 'EN_COURS'
    }
  ];

  // Modals & Formulaires
  showAddPlanningModal = false;
  nouveauPlanning = {
    tache: '',
    technicien: 'Sami Khelifi (Tech Interne)',
    date: 'Lundi 02 Nov 09:00',
    etablissement: 'Lycée Ibn Abi Dhiaf',
    action: 'Dépannage matériel & contrôle connectivité',
    priorite: 'URGENTE' as PlanningItem['priorite']
  };

  showAddOmModal = false;
  nouvelOm = {
    etablissement: 'Lycée Asad Ibn Al Fourat',
    technicienNom: 'Sami Khelifi',
    motifMission: 'Intervention d\'urgence préparation Bac',
    dateDemandee: '2026-10-30 08:30'
  };

  showAddCompteModal = false;
  nouveauCompte = {
    matricule: 'NEW-8801',
    nom: '',
    roleLocal: 'DIRECTEUR' as CompteLocal['roleLocal'],
    etablissement: 'Lycée Ibn Abi Dhiaf',
    email: ''
  };

  // Modal Modification Compte Local (SD-TIC)
  showModalModifierCompteLocal = false;
  formModifierCompteLocal: CompteLocal = {
    id: '',
    matricule: '',
    nom: '',
    roleLocal: 'DIRECTEUR',
    roleLabel: 'Directeur Établissement',
    etablissement: '',
    email: '',
    actif: true
  };

  // Modal Délégation de Tâches aux Agents Administratifs
  // RÈGLE : Seuls les agents affectés à la Direction TIC peuvent être délégués
  showModalDeleguerTache = false;
  agentCibleDelegation: AgentAdminRecord | null = null;
  nouvelleTacheDeleguee = '';

  // Surveillance Réseau : Sonde périodique par paquets IP
  intervalSondeReseau: any = null;

  toastMessage = '';
  isSyncingFirebase = false;

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    public comptesService: ComptesDemandesService,
    public firebaseService: FirebaseService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.demandesComptes$ = this.comptesService.demandes$;
    this.adjointsHabilites$ = this.comptesService.adjoints$;
    this.initFormNouvelleDemande();
    this.loadStats();
    this.demarrerSondeReseau();
    this.initialiserSynchronisationFirestore();
  }

  private initialiserSynchronisationFirestore(): void {
    try {
      this.firebaseService.ecouterCollection<EtablissementCre>('etablissements', (items) => {
        if (items && items.length > 0) {
          this.etablissementsCre = items;
        }
      });

      this.firebaseService.ecouterCollection<CompteLocal>('comptes_locaux', (items) => {
        if (items && items.length > 0) {
          this.comptesLocaux = items;
        }
      });

      this.firebaseService.ecouterCollection<AgentAdminRecord>('agents_administratifs', (items) => {
        if (items && items.length > 0) {
          this.agentsAdminList = items;
        }
      });
    } catch (e) {
      console.warn('Mode hors ligne Firestore :', e);
    }
  }

  synchroniserBaseCompleteVersFirebase(): void {
    this.isSyncingFirebase = true;
    this.http.get<any>('/firebase-seed-data.json').subscribe({
      next: async (seedData) => {
        try {
          const res = await this.firebaseService.injecterDonneesInitiales(seedData);
          this.isSyncingFirebase = false;
          this.afficherToast(`🔥 ${res.details}`);
        } catch (err: any) {
          this.isSyncingFirebase = false;
          console.error('Erreur injection Firebase :', err);
          this.afficherToast(`⚠️ Erreur synchronisation Firebase : ${err?.message || err}`);
        }
      },
      error: (e) => {
        this.isSyncingFirebase = false;
        this.afficherToast('⚠️ Impossible de charger firebase-seed-data.json');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.intervalSondeReseau) {
      clearInterval(this.intervalSondeReseau);
    }
  }

  get personnelsBase(): PersonnelCreRecord[] {
    return this.comptesService.personnelsBase;
  }

  filtrerDemandes(list: DemandeCompteElissaEdunet[] | null): DemandeCompteElissaEdunet[] {
    if (!list) return [];
    return list.filter(d => {
      const matchType = this.filtreTypeCompte === 'TOUS' || d.typePlateforme === this.filtreTypeCompte;
      const matchStatut = this.filtreStatutCompte === 'TOUS' || d.statut === this.filtreStatutCompte;
      return matchType && matchStatut;
    });
  }

  initFormNouvelleDemande(personnel?: PersonnelCreRecord): void {
    const p = personnel || this.personnelsBase[0];
    this.formDemandeCompte = {
      selectedPersonnelMatricule: p?.matricule || '',
      typePlateforme: 'ELISSA',
      matricule: p?.matricule || '',
      cin: p?.cin || '',
      nomDemandeur: p?.nom || '',
      prenomDemandeur: p?.prenom || '',
      emailDemandeur: p?.email || '',
      telephoneDemandeur: p?.telephone || '',
      etablissementOuSiege: p?.etablissementOuSiege || '',
      tacheActuelle: '',
      tachePrecedente: '',
      lieuPrecedent: '',
      chefDirectActuel: '',
      roleEdunetDemande: 'Enseignant / Responsable Pédagogique',
      pieceJointeCinNom: 'Copie_CIN_' + (p?.matricule || 'Scan') + '.pdf',
      pieceJointeArreteNom: 'Decision_Affectation_' + (p?.matricule || 'Arrete') + '.pdf'
    };
  }

  onChangementPersonnelBase(event: any): void {
    const matricule = event.target.value;
    const found = this.personnelsBase.find(p => p.matricule === matricule);
    if (found) {
      this.formDemandeCompte.matricule = found.matricule;
      this.formDemandeCompte.cin = found.cin;
      this.formDemandeCompte.nomDemandeur = found.nom;
      this.formDemandeCompte.prenomDemandeur = found.prenom;
      this.formDemandeCompte.emailDemandeur = found.email;
      this.formDemandeCompte.telephoneDemandeur = found.telephone;
      this.formDemandeCompte.etablissementOuSiege = found.etablissementOuSiege;
      this.formDemandeCompte.pieceJointeCinNom = `Copie_CIN_${found.matricule}.pdf`;
      this.formDemandeCompte.pieceJointeArreteNom = `Arrete_Nomination_${found.matricule}.pdf`;
    }
  }

  ouvrirModalNouvelleDemande(): void {
    this.initFormNouvelleDemande();
    this.showModalDemandeCompte = true;
  }

  soumettreDemandeCompte(): void {
    if (!this.formDemandeCompte.matricule.trim() || !this.formDemandeCompte.cin.trim()) {
      alert('Veuillez renseigner le matricule et le numéro de CIN.');
      return;
    }

    if (this.formDemandeCompte.typePlateforme === 'ELISSA') {
      if (!this.formDemandeCompte.tacheActuelle.trim()) {
        alert('Règle de gestion Elissa : La tâche/fonction actuelle est obligatoire.');
        return;
      }
      if (!this.formDemandeCompte.tachePrecedente.trim() || !this.formDemandeCompte.lieuPrecedent.trim()) {
        alert('Règle de gestion Elissa : La tâche précédente et le lieu précédent sont obligatoires.');
        return;
      }
      if (!this.formDemandeCompte.chefDirectActuel.trim()) {
        alert('Règle de gestion Elissa : Le chef direct actuel est obligatoire.');
        return;
      }
    }

    const created = this.comptesService.soumettreDemande({
      typePlateforme: this.formDemandeCompte.typePlateforme,
      matricule: this.formDemandeCompte.matricule,
      cin: this.formDemandeCompte.cin,
      nomDemandeur: this.formDemandeCompte.nomDemandeur,
      prenomDemandeur: this.formDemandeCompte.prenomDemandeur,
      emailDemandeur: this.formDemandeCompte.emailDemandeur,
      telephoneDemandeur: this.formDemandeCompte.telephoneDemandeur,
      creOrigine: this.selectedCreNom,
      etablissementOuSiege: this.formDemandeCompte.etablissementOuSiege,
      tacheActuelle: this.formDemandeCompte.tacheActuelle,
      tachePrecedente: this.formDemandeCompte.tachePrecedente,
      lieuPrecedent: this.formDemandeCompte.lieuPrecedent,
      chefDirectActuel: this.formDemandeCompte.chefDirectActuel,
      roleEdunetDemande: this.formDemandeCompte.roleEdunetDemande,
      pieceJointeCinNom: this.formDemandeCompte.pieceJointeCinNom,
      pieceJointeArreteNom: this.formDemandeCompte.pieceJointeArreteNom
    });

    this.showModalDemandeCompte = false;
    this.afficherToast(`✅ Demande ${created.codeDemande} (${created.typePlateforme}) créée avec succès pour ${created.prenomDemandeur} ${created.nomDemandeur} !`);
  }

  ouvrirModalAcheminement(dem: DemandeCompteElissaEdunet): void {
    this.selectedDemandeForAcheminement = dem;
    const habilites = this.comptesService.getAdjointsHabilitesComptes();
    if (habilites.length > 0) {
      this.selectedAdjointId = habilites[0].id;
    }
    this.showModalAcheminement = true;
  }

  confirmerAcheminementVersAdjoint(): void {
    if (!this.selectedDemandeForAcheminement) return;
    const adjoint = this.comptesService.getAdjointsHabilitesComptes().find(a => a.id === this.selectedAdjointId) 
      || this.comptesService.getAdjointsHabilitesComptes()[0];
    
    if (!adjoint) {
      alert('Aucun Admin Adjoint habilité trouvé.');
      return;
    }

    const sdticNom = `${this.currentUser?.prenom || 'SD-TIC'} ${this.currentUser?.nom || 'Régional'}`;
    this.comptesService.validerEtAcheminerParSdTic(
      this.selectedDemandeForAcheminement.id,
      sdticNom,
      adjoint
    );

    this.showModalAcheminement = false;
    this.afficherToast(`✅ Demande ${this.selectedDemandeForAcheminement.codeDemande} validée par le SD-TIC et acheminée avec succès vers l'Admin Adjoint ${adjoint.prenom} ${adjoint.nom} (Ministère) !`);
    this.selectedDemandeForAcheminement = null;
  }

  loadStats(): void {
    this.isLoading = true;
    this.http.get<any>('http://localhost:3000/dashboard/stats').subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement stats:', err);
        this.isLoading = false;
      }
    });
  }

  get filteredEtablissements(): EtablissementCre[] {
    return this.etablissementsCre.filter(e => {
      const matchCat = this.selectedCategorie === 'TOUTES' || e.typeCategorie === this.selectedCategorie;
      const matchDel = this.selectedDelegation === 'TOUTES' || e.delegation === this.selectedDelegation;
      const matchSearch = !this.searchTerm || e.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) || e.directeurNom.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchCat && matchDel && matchSearch;
    });
  }

  // --- GESTION DES FLUX D'EMPRUNTS PAR LE SD TIC ---
  validerTransfertEmprunt(flux: FluxEmprunt): void {
    flux.etapeFlux = 'VALIDE_TRANSFERT_SDTIC';
    flux.etapeLabel = 'Transfert validé par le SD TIC · Prêt en cours d\'acheminement';
    this.afficherToast(`✅ Transfert d'emprunt validé par le SD TIC pour ${flux.emprunteurNom}.`);
  }

  validerRecuperationRestitution(flux: FluxEmprunt): void {
    flux.etapeFlux = 'RESTITUTION_VALIDEE';
    flux.etapeLabel = 'Restitution physique validée · Matériel réintégré chez le prêteur';
    this.afficherToast(`✅ Procédure de récupération validée : Matériel restitué à ${flux.preteurNom}.`);
  }

  // --- ORDRES DE MISSION & DEMANDES DE VOITURES (SD-BÂTIMENTS) ---
  creerDemandeOrdreMission(): void {
    if (!this.nouvelOm.motifMission.trim()) return;

    const nouvelOrdre: OrdreMissionDemande = {
      id: `OM-REQ-${String(this.ordresMissionList.length + 1).padStart(2, '0')}`,
      omNumero: `OM-2026-${String(this.ordresMissionList.length + 195).padStart(4, '0')}`,
      etablissement: this.nouvelOm.etablissement,
      technicienNom: this.nouvelOm.technicienNom,
      motifMission: this.nouvelOm.motifMission,
      dateDemandee: this.nouvelOm.dateDemandee,
      statutBatiments: 'EN_ATTENTE_SD_BATIMENTS'
    };

    this.ordresMissionList = [nouvelOrdre, ...this.ordresMissionList];
    this.showAddOmModal = false;
    this.afficherToast(`✅ Demande d'Ordre de Mission ${nouvelOrdre.omNumero} transmise au SD-Bâtiments pour affectation véhicule.`);
  }

  simulerReponseSdBatiments(om: OrdreMissionDemande, valider: boolean): void {
    if (valider) {
      om.statutBatiments = 'VALIDE_AVEC_VEHICULE';
      om.vehiculeAffecte = 'Peugeot Partner (204 TU 1150)';
      om.chauffeurAffecte = 'Amor Trabelsi';
      this.afficherToast(`✅ Le SD-Bâtiments a validé l'OM ${om.omNumero} avec véhicule et chauffeur affectés.`);
    } else {
      om.statutBatiments = 'AJOURNE_REPORTE';
      om.dateAjournee = '2026-11-03 09:00';
      om.motifAjournement = 'Indisponibilité temporaire des véhicules du parc régional.';
      this.afficherToast(`⚠️ Le SD-Bâtiments a ajourné la mission ${om.omNumero} à la date du ${om.dateAjournee}.`);
    }
  }

  // --- PLANNING DU SD TIC ---
  ajouterTachePlanning(): void {
    if (!this.nouveauPlanning.tache.trim()) return;

    const item: PlanningItem = {
      id: `PLN-${String(this.planningList.length + 1).padStart(2, '0')}`,
      tache: this.nouveauPlanning.tache,
      technicien: this.nouveauPlanning.technicien,
      date: this.nouveauPlanning.date,
      etablissement: this.nouveauPlanning.etablissement,
      action: this.nouveauPlanning.action,
      priorite: this.nouveauPlanning.priorite,
      statut: 'PLANIFIE'
    };

    this.planningList = [item, ...this.planningList];
    this.showAddPlanningModal = false;
    this.afficherToast('✅ Nouvelle tâche inscrite au planning d\'intervention du technicien.');
  }

  // --- GESTION DES COMPTES LOCAUX ---
  toggleCompteStatus(compte: CompteLocal): void {
    compte.actif = !compte.actif;
    const statut = compte.actif ? 'activé' : 'suspendu';
    this.afficherToast(`Compte de ${compte.nom} (${compte.roleLabel}) ${statut}.`);
    this.firebaseService.enregistrerDocument('comptes_locaux', compte.id, compte)
      .catch(e => console.warn('Erreur Firestore statut compte :', e));
  }

  ajouterCompteLocal(): void {
    if (!this.nouveauCompte.nom.trim() || !this.nouveauCompte.email.trim()) return;

    const compte: CompteLocal = {
      id: `U-${String(this.comptesLocaux.length + 1).padStart(2, '0')}`,
      matricule: this.nouveauCompte.matricule,
      nom: this.nouveauCompte.nom,
      roleLocal: this.nouveauCompte.roleLocal,
      roleLabel: this.getRoleLabel(this.nouveauCompte.roleLocal),
      etablissement: this.nouveauCompte.etablissement,
      email: this.nouveauCompte.email,
      actif: true
    };

    this.comptesLocaux = [compte, ...this.comptesLocaux];
    this.showAddCompteModal = false;
    this.afficherToast(`✅ Compte local créé pour ${compte.nom} (${compte.roleLabel}).`);

    this.firebaseService.enregistrerDocument('comptes_locaux', compte.id, compte)
      .catch(e => console.warn('Erreur Firestore nouveau compte :', e));
  }

  getRoleLabel(role: CompteLocal['roleLocal']): string {
    switch(role) {
      case 'DIRECTEUR': return 'Directeur d\'Établissement';
      case 'TECHNICIEN_INTERNE': return 'Technicien Interne CRE';
      case 'TECHNICIEN_PRESTATAIRE': return 'Technicien Prestataire Marché';
      case 'PROF': return 'Professeur Responsable';
      case 'AGENT_ADMIN': return 'Agent Administratif';
      case 'SECRETAIRE_GENERAL': return 'Secrétaire Général';
      case 'RESPONSABLE_EXAMEN': return 'Responsable Examens (Bac)';
      case 'INSPECTEUR': return 'Inspecteur Pédagogique TIC';
      case 'SD_BATIMENTS': return 'Sous-Directeur Bâtiments & Parc Auto';
      default: return 'Utilisateur Local';
    }
  }

  // --- CRUD COMPLET COMPTES LOCAUX (SD-TIC) ---
  ouvrirModalModifierCompteLocal(compte: CompteLocal): void {
    this.formModifierCompteLocal = { ...compte };
    this.showModalModifierCompteLocal = true;
  }

  enregistrerModificationCompteLocal(): void {
    const idx = this.comptesLocaux.findIndex(c => c.id === this.formModifierCompteLocal.id);
    if (idx !== -1) {
      this.formModifierCompteLocal.roleLabel = this.getRoleLabel(this.formModifierCompteLocal.roleLocal);
      this.comptesLocaux[idx] = { ...this.formModifierCompteLocal };
      this.showModalModifierCompteLocal = false;
      this.afficherToast(`✅ Compte local de ${this.formModifierCompteLocal.nom} mis à jour avec succès.`);

      this.firebaseService.enregistrerDocument('comptes_locaux', this.formModifierCompteLocal.id, this.formModifierCompteLocal)
        .catch(e => console.warn('Erreur Firestore MAJ compte :', e));
    }
  }

  supprimerCompteLocal(compte: CompteLocal): void {
    if (confirm(`Confirmez-vous la suppression définitive du compte de ${compte.nom} (${compte.roleLabel}) ?`)) {
      this.comptesLocaux = this.comptesLocaux.filter(c => c.id !== compte.id);
      this.afficherToast(`🗑️ Compte local de ${compte.nom} supprimé.`);

      this.firebaseService.supprimerDocument('comptes_locaux', compte.id)
        .catch(e => console.warn('Erreur Firestore suppression compte :', e));
    }
  }

  // --- DÉLÉGATION DE TÂCHES AUX AGENTS (RÈGLE STRICTE DIRECTION TIC) ---
  estEligibleDelegationTic(agent: AgentAdminRecord): boolean {
    if (!agent) return false;
    const dir = (agent.direction || '').toLowerCase();
    const srv = (agent.service || '').toLowerCase();
    return dir.includes('tic') || dir.includes('informatique') || srv.includes('tic') || srv.includes('informatique');
  }

  ouvrirModalDeleguerTache(agent: AgentAdminRecord): void {
    if (!this.estEligibleDelegationTic(agent)) {
      alert(`⛔ Action Interdite : Seuls les agents expressément affectés à la Direction TIC peuvent recevoir des délégations de tâches par le SD-TIC.\n\n${agent.prenom} ${agent.nom} relève de "${agent.direction}".`);
      return;
    }
    this.agentCibleDelegation = agent;
    this.nouvelleTacheDeleguee = '';
    this.showModalDeleguerTache = true;
  }

  validerDelegationTache(): void {
    if (!this.agentCibleDelegation || !this.nouvelleTacheDeleguee.trim()) return;
    if (!this.estEligibleDelegationTic(this.agentCibleDelegation)) {
      alert('Erreur : Agent non habilité.');
      return;
    }
    this.agentCibleDelegation.tachesDeleguees.push(this.nouvelleTacheDeleguee.trim());
    this.afficherToast(`✅ Tâche déléguée avec succès à ${this.agentCibleDelegation.prenom} ${this.agentCibleDelegation.nom} (Direction TIC).`);
    this.showModalDeleguerTache = false;
    this.nouvelleTacheDeleguee = '';
    this.agentCibleDelegation = null;
  }

  supprimerTacheDeleguee(agent: AgentAdminRecord, idx: number): void {
    agent.tachesDeleguees.splice(idx, 1);
    this.afficherToast('Tâche déléguée retirée de l\'agent.');
  }

  // --- DÉTAIL DES PANNES ÉQUIPEMENTS (RÉGION) ---
  get totalPcBureauEnPanneRegional(): number {
    return this.etablissementsCre.reduce((sum, e) => sum + (e.pannesDetail?.pcBureau || 0), 0);
  }

  get totalPcPortableEnPanneRegional(): number {
    return this.etablissementsCre.reduce((sum, e) => sum + (e.pannesDetail?.pcPortable || 0), 0);
  }

  get totalImprimantesEnPanneRegional(): number {
    return this.etablissementsCre.reduce((sum, e) => sum + (e.pannesDetail?.imprimanteScanner || 0), 0);
  }

  get totalReseauEnPanneRegional(): number {
    return this.etablissementsCre.reduce((sum, e) => sum + (e.pannesDetail?.reseauSwitch || 0), 0);
  }

  // --- SONDE RÉSEAU PÉRIODIQUE PAR IP PUBLIQUE ---
  demarrerSondeReseau(): void {
    this.intervalSondeReseau = setInterval(() => {
      const maintenant = new Date().toLocaleTimeString('fr-FR');
      this.etablissementsCre.forEach(etab => {
        etab.dernierPaquetRecu = maintenant;
        if (etab.circuitStatut === 'COUPURE') {
          etab.historiquePaquets.push('PERDU');
          if (etab.historiquePaquets.length > 10) etab.historiquePaquets.shift();
          etab.latenceMs = 0;
          etab.debitDescendant = 0;
          etab.debitMontant = 0;
          const perdus = etab.historiquePaquets.filter(p => p === 'PERDU').length;
          etab.pertePaquetsPct = Math.round((perdus / etab.historiquePaquets.length) * 100);
          etab.alerteAutomatiqueSonde = '🚨 Coupure totale détectée par sonde IP (0 paquet reçu)';
        } else {
          const perteOccasionnelle = Math.random() < 0.05;
          const paquetStatut: 'RECU' | 'PERDU' = perteOccasionnelle ? 'PERDU' : 'RECU';
          etab.historiquePaquets.push(paquetStatut);
          if (etab.historiquePaquets.length > 10) etab.historiquePaquets.shift();

          const perdus = etab.historiquePaquets.filter(p => p === 'PERDU').length;
          etab.pertePaquetsPct = Math.round((perdus / etab.historiquePaquets.length) * 100);

          if (etab.circuitStatut === 'FIBRE_OK') {
            etab.latenceMs = Math.floor(12 + Math.random() * 8);
            etab.debitDescendant = Math.round((48 + Math.random() * 4) * 10) / 10;
            etab.debitMontant = Math.round((19 + Math.random() * 2) * 10) / 10;
            etab.alerteAutomatiqueSonde = undefined;
          } else {
            // FLYBOX_SECOURS
            etab.latenceMs = Math.floor(35 + Math.random() * 20);
            etab.debitDescendant = Math.round((18 + Math.random() * 5) * 10) / 10;
            etab.debitMontant = Math.round((6 + Math.random() * 2) * 10) / 10;
            etab.alerteAutomatiqueSonde = '⚠️ Connexion sur Flybox 4G de secours (Débit réduit)';
          }
        }
      });
    }, 5000);
  }

  testerConnexionEtablissement(etab: EtablissementCre): void {
    const maintenant = new Date().toLocaleTimeString('fr-FR');
    etab.dernierPaquetRecu = maintenant;
    if (etab.circuitStatut === 'COUPURE') {
      this.afficherToast(`🚨 Test Sonde IP sur ${etab.ipPublique} (${etab.nom}) : 100% de paquets perdus. Ligne coupée !`);
    } else {
      this.afficherToast(`📡 Test Sonde IP sur ${etab.ipPublique} (${etab.nom}) : Réponse en ${etab.latenceMs}ms · Débit : ${etab.debitDescendant} Mbps · 0% perte.`);
    }
  }

  afficherToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => this.toastMessage = '', 4500);
  }
}