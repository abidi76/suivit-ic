import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserAccount } from '../../core/services/auth.service';

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
  tachesAutorisees: {
    arrivages: boolean;
    inventaires: boolean;
    pannesPertes: boolean;
    comptesLocaux: boolean;
    rapports: boolean;
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
  activeTab: 'global' | 'cre-list' | 'adjoints' | 'arrivages' = 'global';

  // Filtres multidimensionnels nationaux
  selectedCre = 'TOUS';
  selectedEtabType = 'TOUS';
  selectedAppelOffre = 'TOUS';
  selectedStatut = 'TOUS';
  searchTerm = '';

  // Liste de tous les CRE de la République
  creList: CreSupervision[] = [
    {
      id: 'CRE-01',
      nom: 'CRE Manouba',
      gouvernorat: 'Manouba',
      sdticNom: 'Mohamed Gharbi (SD TIC)',
      sdticEmail: 'sdtic.manouba@edunet.tn',
      sdticActif: true,
      totalEtablissements: 48,
      totalEquipements: 1840,
      enService: 1612,
      enPanne: 148,
      arrivagesEnAttente: 3,
      reclamationsOuvertes: 19
    },
    {
      id: 'CRE-02',
      nom: 'CRE Tunis',
      gouvernorat: 'Tunis',
      sdticNom: 'Kamel Trabelsi (Directeur TIC)',
      sdticEmail: 'directeurtic.tunis@edunet.tn',
      sdticActif: true,
      totalEtablissements: 92,
      totalEquipements: 3950,
      enService: 3480,
      enPanne: 310,
      arrivagesEnAttente: 5,
      reclamationsOuvertes: 34
    },
    {
      id: 'CRE-03',
      nom: 'CRE Ariana',
      gouvernorat: 'Ariana',
      sdticNom: 'Leila Riahi (SD TIC)',
      sdticEmail: 'sdtic.ariana@edunet.tn',
      sdticActif: true,
      totalEtablissements: 56,
      totalEquipements: 2410,
      enService: 2150,
      enPanne: 180,
      arrivagesEnAttente: 2,
      reclamationsOuvertes: 14
    },
    {
      id: 'CRE-04',
      nom: 'CRE Ben Arous',
      gouvernorat: 'Ben Arous',
      sdticNom: 'Anis Chahed (Directeur TIC)',
      sdticEmail: 'directeurtic.benarous@edunet.tn',
      sdticActif: true,
      totalEtablissements: 64,
      totalEquipements: 2890,
      enService: 2540,
      enPanne: 220,
      arrivagesEnAttente: 4,
      reclamationsOuvertes: 22
    },
    {
      id: 'CRE-05',
      nom: 'CRE Bizerte',
      gouvernorat: 'Bizerte',
      sdticNom: 'Zouhair Dridi (SD TIC)',
      sdticEmail: 'sdtic.bizerte@edunet.tn',
      sdticActif: true,
      totalEtablissements: 58,
      totalEquipements: 2180,
      enService: 1890,
      enPanne: 190,
      arrivagesEnAttente: 1,
      reclamationsOuvertes: 16
    },
    {
      id: 'CRE-06',
      nom: 'CRE Sfax 1',
      gouvernorat: 'Sfax',
      sdticNom: 'Hichem Fakhfakh (SD TIC)',
      sdticEmail: 'sdtic.sfax1@edunet.tn',
      sdticActif: true,
      totalEtablissements: 72,
      totalEquipements: 3100,
      enService: 2780,
      enPanne: 230,
      arrivagesEnAttente: 3,
      reclamationsOuvertes: 25
    }
  ];

  // Gestion des 3 Admin Central-Adjoints
  // RÈGLE : Seul l'Admin Central titulaire affecte ou interdit des tâches aux adjoints
  adjointsList: AdjointManagement[] = [
    {
      id: 'ADJ-01',
      nom: 'Fatma Ben Romdhane',
      email: 'adjoint1@edunet.tn',
      tachesAutorisees: {
        arrivages: false,
        inventaires: true,
        pannesPertes: true,
        comptesLocaux: false,
        rapports: true
      }
    },
    {
      id: 'ADJ-02',
      nom: 'Tarek Mezghani',
      email: 'adjoint2@edunet.tn',
      tachesAutorisees: {
        arrivages: true,
        inventaires: false,
        pannesPertes: true,
        comptesLocaux: true,
        rapports: false
      }
    },
    {
      id: 'ADJ-03',
      nom: 'Rim Bouzidi',
      email: 'adjoint3@edunet.tn',
      tachesAutorisees: {
        arrivages: false,
        inventaires: true,
        pannesPertes: false,
        comptesLocaux: true,
        rapports: true
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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
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
    setTimeout(() => this.toastMessage = '', 4000);
  }
}
