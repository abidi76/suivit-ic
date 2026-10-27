import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserAccount } from '../../core/services/auth.service';

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
export class DashboardComponent implements OnInit {
  stats: any = null;
  isLoading = true;
  currentUser: UserAccount | null = null;
  activeTab: 'supervision' | 'comptes-locaux' | 'agents-admin' | 'prestataires' | 'flux-emprunts' | 'ordres-mission' | 'planning' = 'supervision';

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

  // 1. Liste des Établissements de la CRE sélectionnée (Siège central, Écoles primaires, Collèges, Collèges techniques, Lycées)
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
      circuitStatut: 'FIBRE_OK'
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
      circuitStatut: 'FIBRE_OK'
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
      circuitStatut: 'FIBRE_OK'
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
      circuitStatut: 'FLYBOX_SECOURS'
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
      circuitStatut: 'FLYBOX_SECOURS'
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
      circuitStatut: 'FIBRE_OK'
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
      circuitStatut: 'FLYBOX_SECOURS'
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
      circuitStatut: 'COUPURE'
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

  // 2b. Annuaire et gestion des Agents Administratifs (Siège, CREFOC, Établissements) pré-saisis par le SD-TIC
  agentsAdminList: AgentAdminRecord[] = [
    {
      id: 'ADM-01',
      matricule: 'ADM-7101',
      nom: 'Ben Abdallah',
      prenom: 'Najla',
      direction: 'Direction des Affaires Pédagogiques & Formation',
      service: 'Service de Coordination Pédagogique & CREFOC',
      bureau: 'Bureau 14 (Aile B)',
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
        'Inventaire trimestriel des postes administratifs (Bureaux 10 à 18)',
        'Pointage de présence des techniciens prestataires externes'
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
      tachesDeleguees: [
        'Vérification des accès WiFi des salles de formation continue'
      ]
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
      tachesDeleguees: [
        'Transmission des demandes de consommables de l\'établissement'
      ]
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

  toastMessage = '';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadStats();
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

  afficherToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => this.toastMessage = '', 4500);
  }
}