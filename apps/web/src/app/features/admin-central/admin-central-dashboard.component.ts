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
  arrivagesEnAttente: number;
  reclamationsOuvertes: number;
}

export interface AdjointManagement {
  id: string;
  nom: string;
  email: string;
  matricule?: string;
  telephone?: string;
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

  // Liste officielle et complète des 26 Commissariats Régionaux de l'Éducation (CRE) de la République Tunisienne
  creList: CreSupervision[] = [
    { id: 'CRE-01', nom: 'CRE Tunis 1', gouvernorat: 'Tunis', sdticNom: 'Kamel Trabelsi (Directeur TIC)', sdticEmail: 'directeurtic.tunis1@edunet.tn', sdticActif: true, totalEtablissements: 88, totalEquipements: 3950, enService: 3580, enPanne: 270, arrivagesEnAttente: 4, reclamationsOuvertes: 28 },
    { id: 'CRE-02', nom: 'CRE Tunis 2', gouvernorat: 'Tunis', sdticNom: 'Mourad Cherif (SD TIC)', sdticEmail: 'sdtic.tunis2@edunet.tn', sdticActif: true, totalEtablissements: 76, totalEquipements: 3340, enService: 3010, enPanne: 210, arrivagesEnAttente: 3, reclamationsOuvertes: 21 },
    { id: 'CRE-03', nom: 'CRE Ariana', gouvernorat: 'Ariana', sdticNom: 'Leila Riahi (SD TIC)', sdticEmail: 'sdtic.ariana@edunet.tn', sdticActif: true, totalEtablissements: 62, totalEquipements: 2680, enService: 2410, enPanne: 180, arrivagesEnAttente: 2, reclamationsOuvertes: 16 },
    { id: 'CRE-04', nom: 'CRE Ben Arous', gouvernorat: 'Ben Arous', sdticNom: 'Anis Chahed (Directeur TIC)', sdticEmail: 'directeurtic.benarous@edunet.tn', sdticActif: true, totalEtablissements: 68, totalEquipements: 2940, enService: 2620, enPanne: 220, arrivagesEnAttente: 3, reclamationsOuvertes: 24 },
    { id: 'CRE-05', nom: 'CRE Manouba', gouvernorat: 'Manouba', sdticNom: 'Mohamed Gharbi (SD TIC)', sdticEmail: 'sdtic.manouba@edunet.tn', sdticActif: true, totalEtablissements: 48, totalEquipements: 1840, enService: 1612, enPanne: 148, arrivagesEnAttente: 3, reclamationsOuvertes: 19 },
    { id: 'CRE-06', nom: 'CRE Nabeul', gouvernorat: 'Nabeul', sdticNom: 'Foued Ben Romdhane (SD TIC)', sdticEmail: 'sdtic.nabeul@edunet.tn', sdticActif: true, totalEtablissements: 84, totalEquipements: 3420, enService: 3080, enPanne: 240, arrivagesEnAttente: 4, reclamationsOuvertes: 27 },
    { id: 'CRE-07', nom: 'CRE Zaghouan', gouvernorat: 'Zaghouan', sdticNom: 'Tarek Hamdi (SD TIC)', sdticEmail: 'sdtic.zaghouan@edunet.tn', sdticActif: true, totalEtablissements: 36, totalEquipements: 1220, enService: 1090, enPanne: 90, arrivagesEnAttente: 1, reclamationsOuvertes: 9 },
    { id: 'CRE-08', nom: 'CRE Bizerte', gouvernorat: 'Bizerte', sdticNom: 'Zouhair Dridi (SD TIC)', sdticEmail: 'sdtic.bizerte@edunet.tn', sdticActif: true, totalEtablissements: 66, totalEquipements: 2540, enService: 2260, enPanne: 190, arrivagesEnAttente: 2, reclamationsOuvertes: 18 },
    { id: 'CRE-09', nom: 'CRE Béja', gouvernorat: 'Béja', sdticNom: 'Mongi Mejri (SD TIC)', sdticEmail: 'sdtic.beja@edunet.tn', sdticActif: true, totalEtablissements: 44, totalEquipements: 1560, enService: 1380, enPanne: 130, arrivagesEnAttente: 2, reclamationsOuvertes: 14 },
    { id: 'CRE-10', nom: 'CRE Jendouba', gouvernorat: 'Jendouba', sdticNom: 'Chokri Gharbi (SD TIC)', sdticEmail: 'sdtic.jendouba@edunet.tn', sdticActif: true, totalEtablissements: 52, totalEquipements: 1780, enService: 1540, enPanne: 160, arrivagesEnAttente: 1, reclamationsOuvertes: 17 },
    { id: 'CRE-11', nom: 'CRE Le Kef', gouvernorat: 'Le Kef', sdticNom: 'Habib Bouzidi (SD TIC)', sdticEmail: 'sdtic.lekef@edunet.tn', sdticActif: true, totalEtablissements: 46, totalEquipements: 1490, enService: 1310, enPanne: 120, arrivagesEnAttente: 2, reclamationsOuvertes: 11 },
    { id: 'CRE-12', nom: 'CRE Siliana', gouvernorat: 'Siliana', sdticNom: 'Moncef Ayari (SD TIC)', sdticEmail: 'sdtic.siliana@edunet.tn', sdticActif: true, totalEtablissements: 42, totalEquipements: 1380, enService: 1220, enPanne: 110, arrivagesEnAttente: 1, reclamationsOuvertes: 10 },
    { id: 'CRE-13', nom: 'CRE Sousse', gouvernorat: 'Sousse', sdticNom: 'Walid Ben Ammar (Directeur TIC)', sdticEmail: 'directeurtic.sousse@edunet.tn', sdticActif: true, totalEtablissements: 78, totalEquipements: 3620, enService: 3290, enPanne: 240, arrivagesEnAttente: 5, reclamationsOuvertes: 29 },
    { id: 'CRE-14', nom: 'CRE Monastir', gouvernorat: 'Monastir', sdticNom: 'Ridha Khelil (SD TIC)', sdticEmail: 'sdtic.monastir@edunet.tn', sdticActif: true, totalEtablissements: 64, totalEquipements: 2820, enService: 2570, enPanne: 180, arrivagesEnAttente: 3, reclamationsOuvertes: 17 },
    { id: 'CRE-15', nom: 'CRE Mahdia', gouvernorat: 'Mahdia', sdticNom: 'Amor Sassi (SD TIC)', sdticEmail: 'sdtic.mahdia@edunet.tn', sdticActif: true, totalEtablissements: 54, totalEquipements: 2190, enService: 1950, enPanne: 160, arrivagesEnAttente: 2, reclamationsOuvertes: 15 },
    { id: 'CRE-16', nom: 'CRE Sfax 1', gouvernorat: 'Sfax', sdticNom: 'Hichem Fakhfakh (SD TIC)', sdticEmail: 'sdtic.sfax1@edunet.tn', sdticActif: true, totalEtablissements: 74, totalEquipements: 3280, enService: 2960, enPanne: 220, arrivagesEnAttente: 4, reclamationsOuvertes: 26 },
    { id: 'CRE-17', nom: 'CRE Sfax 2', gouvernorat: 'Sfax', sdticNom: 'Nabil Louati (Directeur TIC)', sdticEmail: 'directeurtic.sfax2@edunet.tn', sdticActif: true, totalEtablissements: 69, totalEquipements: 3120, enService: 2810, enPanne: 210, arrivagesEnAttente: 3, reclamationsOuvertes: 22 },
    { id: 'CRE-18', nom: 'CRE Kairouan', gouvernorat: 'Kairouan', sdticNom: 'Brahim Hammami (SD TIC)', sdticEmail: 'sdtic.kairouan@edunet.tn', sdticActif: true, totalEtablissements: 72, totalEquipements: 2640, enService: 2290, enPanne: 250, arrivagesEnAttente: 2, reclamationsOuvertes: 25 },
    { id: 'CRE-19', nom: 'CRE Kasserine', gouvernorat: 'Kasserine', sdticNom: 'Lotfi Rahmouni (SD TIC)', sdticEmail: 'sdtic.kasserine@edunet.tn', sdticActif: true, totalEtablissements: 65, totalEquipements: 2280, enService: 1970, enPanne: 210, arrivagesEnAttente: 2, reclamationsOuvertes: 23 },
    { id: 'CRE-20', nom: 'CRE Sidi Bouzid', gouvernorat: 'Sidi Bouzid', sdticNom: 'Abdelkader Dabbabi (SD TIC)', sdticEmail: 'sdtic.sidibouzid@edunet.tn', sdticActif: true, totalEtablissements: 61, totalEquipements: 2150, enService: 1870, enPanne: 200, arrivagesEnAttente: 2, reclamationsOuvertes: 20 },
    { id: 'CRE-21', nom: 'CRE Gafsa', gouvernorat: 'Gafsa', sdticNom: 'Hedi Gouader (SD TIC)', sdticEmail: 'sdtic.gafsa@edunet.tn', sdticActif: true, totalEtablissements: 56, totalEquipements: 2040, enService: 1790, enPanne: 180, arrivagesEnAttente: 2, reclamationsOuvertes: 18 },
    { id: 'CRE-22', nom: 'CRE Tozeur', gouvernorat: 'Tozeur', sdticNom: 'Salem Marzouki (SD TIC)', sdticEmail: 'sdtic.tozeur@edunet.tn', sdticActif: true, totalEtablissements: 32, totalEquipements: 1110, enService: 1010, enPanne: 70, arrivagesEnAttente: 1, reclamationsOuvertes: 8 },
    { id: 'CRE-23', nom: 'CRE Kébili', gouvernorat: 'Kébili', sdticNom: 'Mabrouk Saad (SD TIC)', sdticEmail: 'sdtic.kebili@edunet.tn', sdticActif: true, totalEtablissements: 34, totalEquipements: 1180, enService: 1060, enPanne: 80, arrivagesEnAttente: 1, reclamationsOuvertes: 9 },
    { id: 'CRE-24', nom: 'CRE Gabès', gouvernorat: 'Gabès', sdticNom: 'Farhat Chaabani (SD TIC)', sdticEmail: 'sdtic.gabes@edunet.tn', sdticActif: true, totalEtablissements: 58, totalEquipements: 2340, enService: 2080, enPanne: 190, arrivagesEnAttente: 3, reclamationsOuvertes: 19 },
    { id: 'CRE-25', nom: 'CRE Médenine', gouvernorat: 'Médenine', sdticNom: 'Ali Ghomrasni (Directeur TIC)', sdticEmail: 'directeurtic.medenine@edunet.tn', sdticActif: true, totalEtablissements: 70, totalEquipements: 2790, enService: 2470, enPanne: 220, arrivagesEnAttente: 3, reclamationsOuvertes: 21 },
    { id: 'CRE-26', nom: 'CRE Tataouine', gouvernorat: 'Tataouine', sdticNom: 'Béchir Abdelmoula (SD TIC)', sdticEmail: 'sdtic.tataouine@edunet.tn', sdticActif: true, totalEtablissements: 33, totalEquipements: 1090, enService: 990, enPanne: 70, arrivagesEnAttente: 1, reclamationsOuvertes: 7 }
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

  // Chiffres consolidés nationaux
  get totalEquipementsNational(): number {
    return this.creList.reduce((acc, c) => acc + c.totalEquipements, 0);
  }

  get totalEnServiceNational(): number {
    return this.creList.reduce((acc, c) => acc + c.enService, 0);
  }

  get totalEnPanneNational(): number {
    return this.creList.reduce((acc, c) => acc + c.enPanne, 0);
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
    const etat = cre.sdticActif ? 'activé' : 'suspendu';
    this.afficherToast(`Compte de ${cre.sdticNom} ${etat}.`);
  }

  afficherToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => this.toastMessage = '', 4500);
  }
}

