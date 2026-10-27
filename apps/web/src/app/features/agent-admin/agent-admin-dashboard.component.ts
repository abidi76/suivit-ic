import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserAccount, DotationEquipement } from '../../core/services/auth.service';

export interface ReclamationAdmin {
  id: string;
  ticketNumero: string;
  categorie: 'MATERIEL' | 'LOGICIEL_APPLICATION' | 'RESEAU_LOCAL_CRE';
  categorieLabel: string;
  titre: string;
  equipementConcerne?: string;
  numeroSerie?: string;
  logicielConcerne?: string;
  detailsPanne: string;
  criticite: 'FAIBLE' | 'MOYENNE' | 'URGENTE';
  dateCreation: string;
  statut: 'TRANSMIS_SD_TIC' | 'AFFECTE_TECHNICIEN' | 'EN_COURS' | 'RESOLU';
  statutLabel: string;
  reponseTechnique?: string;
}

export interface TacheDeleguee {
  id: string;
  titre: string;
  description: string;
  deleguePar: string;
  dateAttribution: string;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINEE';
  commentairesAgent?: string;
}

@Component({
  selector: 'app-agent-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-admin-dashboard.component.html',
  styleUrls: ['./agent-admin-dashboard.component.scss']
})
export class AgentAdminDashboardComponent implements OnInit {
  currentUser: UserAccount | null = null;
  activeTab: 'dotations' | 'reclamations' | 'delegations' = 'dotations';

  // Modal Nouvelle Réclamation
  showModalReclamation = false;
  nouvelleReclamation = {
    categorie: 'MATERIEL' as 'MATERIEL' | 'LOGICIEL_APPLICATION' | 'RESEAU_LOCAL_CRE',
    titre: '',
    equipementId: '',
    equipementConcerne: '',
    numeroSerie: '',
    logicielConcerne: 'Portail Edunet & Messagerie',
    detailsPanne: '',
    criticite: 'MOYENNE' as 'FAIBLE' | 'MOYENNE' | 'URGENTE'
  };

  // Liste des applications institutionnelles et logicielles
  applicationsDisponibles: string[] = [
    'Portail National Edunet & Messagerie Institutionnelle',
    'Système de Gestion des Notes & Bulletins Scolaires',
    'Application de Gestion Budgétaire & Comptable CRE',
    'Progiciel GRH & Suivi Administratif des Personnels',
    'Plateforme E-learning / Formation Continue CREFOC',
    'Suite Bureautique (LibreOffice / Microsoft Office)',
    'Antivirus & Pare-feu Poste de Travail',
    'Pilote & Utilitaires Imprimante Réseau'
  ];

  // Historique des réclamations de cet agent administratif
  reclamationsList: ReclamationAdmin[] = [
    {
      id: 'REC-ADM-01',
      ticketNumero: 'TICK-ADM-2026-081',
      categorie: 'MATERIEL',
      categorieLabel: 'Panne Matérielle (Équipement)',
      titre: 'Imprimante HP LaserJet ne répond plus et voyant toner clignotant',
      equipementConcerne: 'HP LaserJet Pro MFP M428fdw',
      numeroSerie: 'SN-HP-MFP428-771204',
      detailsPanne: 'Bourrage papier systématique dans le bac 2 et blocage du tambour d\'impression.',
      criticite: 'URGENTE',
      dateCreation: 'Aujourd\'hui 08:30',
      statut: 'AFFECTE_TECHNICIEN',
      statutLabel: 'Affecté au Technicien Interne par le SD-TIC',
      reponseTechnique: 'Prise en charge par Sami Khelifi (Technicien CRE) - Nettoyage galets prévu ce matin.'
    },
    {
      id: 'REC-ADM-02',
      ticketNumero: 'TICK-ADM-2026-064',
      categorie: 'RESEAU_LOCAL_CRE',
      categorieLabel: 'Réseau Local CRE (LAN)',
      titre: 'Déconnexion intermittente du serveur de fichiers partagés CRE',
      equipementConcerne: 'Prise Murale PRISE-RJ45-B14-02',
      numeroSerie: 'SW-CORE-B1 / Port 18',
      detailsPanne: 'Accès impossible au répertoire partagé des dossiers administratifs durant les heures de pointe.',
      criticite: 'MOYENNE',
      dateCreation: 'Hier 14:15',
      statut: 'RESOLU',
      statutLabel: 'Résolu & Vérifié',
      reponseTechnique: 'Reconnexion du patch câble baie de brassage et réinitialisation du port VLAN 10.'
    },
    {
      id: 'REC-ADM-03',
      ticketNumero: 'TICK-ADM-2026-042',
      categorie: 'LOGICIEL_APPLICATION',
      categorieLabel: 'Application Métier',
      titre: 'Erreur d\'authentification certificat sur le progiciel GRH',
      logicielConcerne: 'Progiciel GRH & Suivi Administratif des Personnels',
      detailsPanne: 'Message: "Session expirée / certificat SSL révoqué" lors de la validation des fiches de congés.',
      criticite: 'MOYENNE',
      dateCreation: '22/10/2026',
      statut: 'RESOLU',
      statutLabel: 'Résolu & Vérifié',
      reponseTechnique: 'Mise à jour du magasin de certificats et vidage du cache applicatif.'
    }
  ];

  // Tâches déléguées par le SD-TIC
  tachesDelegueesList: TacheDeleguee[] = [
    {
      id: 'TACHE-01',
      titre: 'Recensement et inventaire annuel des postes administratifs (Aile B)',
      description: 'Vérifier la concordance des N° de série des UC, écrans et imprimantes dans les bureaux 10 à 18.',
      deleguePar: 'M. Mohamed Gharbi (SD TIC)',
      dateAttribution: '20/10/2026',
      statut: 'EN_COURS',
      commentairesAgent: 'Bureaux 10, 11, 12, 13 et 14 déjà vérifiés et conformes.'
    },
    {
      id: 'TACHE-02',
      titre: 'Pointage de présence et fiche de passage des prestataires externes',
      description: 'Faire signer le registre de passage à chaque passage des techniciens de la société prestataire (ex: MICRO-TECH).',
      deleguePar: 'M. Mohamed Gharbi (SD TIC)',
      dateAttribution: '15/10/2026',
      statut: 'EN_COURS',
      commentairesAgent: 'Registre à jour au secrétariat.'
    },
    {
      id: 'TACHE-03',
      titre: 'Distribution des cartouches de toner réceptionnées pour le CREFOC',
      description: 'Remettre les 6 toners noirs HP aux formateurs du centre régional de formation continue.',
      deleguePar: 'M. Mohamed Gharbi (SD TIC)',
      dateAttribution: '12/10/2026',
      statut: 'TERMINEE',
      commentairesAgent: 'Livraison effectuée et émargée le 14/10/2026.'
    }
  ];

  toastMessage = '';

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
  }

  get equipementsDotation(): DotationEquipement[] {
    return this.currentUser?.agentProfile?.equipementsDotation || [];
  }

  ouvrirModalReclamation(categorie: 'MATERIEL' | 'LOGICIEL_APPLICATION' | 'RESEAU_LOCAL_CRE'): void {
    this.nouvelleReclamation.categorie = categorie;
    this.nouvelleReclamation.titre = '';
    this.nouvelleReclamation.detailsPanne = '';
    this.nouvelleReclamation.criticite = 'MOYENNE';

    if (categorie === 'MATERIEL') {
      const premier = this.equipementsDotation[0];
      if (premier) {
        this.nouvelleReclamation.equipementId = premier.id;
        this.nouvelleReclamation.equipementConcerne = premier.type + ' - ' + premier.marqueModele;
        this.nouvelleReclamation.numeroSerie = premier.numeroSerie;
      }
    } else if (categorie === 'RESEAU_LOCAL_CRE') {
      this.nouvelleReclamation.equipementConcerne = `Réseau Local CRE - Prise: ${this.currentUser?.agentProfile?.priseMurale || 'Prise Bureau'}`;
      this.nouvelleReclamation.numeroSerie = this.currentUser?.agentProfile?.switchPort || 'Port Switch';
      this.nouvelleReclamation.titre = 'Coupure ou anomalie sur le réseau local du bureau';
    } else {
      this.nouvelleReclamation.logicielConcerne = this.applicationsDisponibles[0];
      this.nouvelleReclamation.titre = 'Dysfonctionnement de l\'application';
      this.nouvelleReclamation.numeroSerie = 'APP-LIC-EDUNET';
    }

    this.showModalReclamation = true;
  }

  onSelectEquipementChange(event: any): void {
    const selectedId = event.target.value;
    const found = this.equipementsDotation.find(e => e.id === selectedId);
    if (found) {
      this.nouvelleReclamation.equipementId = found.id;
      this.nouvelleReclamation.equipementConcerne = found.type + ' - ' + found.marqueModele;
      this.nouvelleReclamation.numeroSerie = found.numeroSerie;
    }
  }

  soumettreReclamation(): void {
    if (!this.nouvelleReclamation.titre.trim()) {
      alert('Veuillez indiquer un titre ou un motif à votre réclamation.');
      return;
    }
    if (!this.nouvelleReclamation.detailsPanne.trim()) {
      alert('Veuillez décrire le problème rencontré.');
      return;
    }

    if (this.nouvelleReclamation.categorie === 'MATERIEL' && !this.nouvelleReclamation.numeroSerie.trim()) {
      alert('Règle de gestion : Le Numéro de Série est obligatoire pour toute réclamation sur un équipement.');
      return;
    }

    const newTicket: ReclamationAdmin = {
      id: 'REC-ADM-' + Date.now(),
      ticketNumero: 'TICK-ADM-2026-' + Math.floor(100 + Math.random() * 900),
      categorie: this.nouvelleReclamation.categorie,
      categorieLabel: this.getCategorieLabel(this.nouvelleReclamation.categorie),
      titre: this.nouvelleReclamation.titre,
      equipementConcerne: this.nouvelleReclamation.categorie === 'MATERIEL' 
        ? this.nouvelleReclamation.equipementConcerne 
        : (this.nouvelleReclamation.categorie === 'RESEAU_LOCAL_CRE' ? 'Prise Réseau ' + this.currentUser?.agentProfile?.priseMurale : undefined),
      numeroSerie: this.nouvelleReclamation.numeroSerie,
      logicielConcerne: this.nouvelleReclamation.categorie === 'LOGICIEL_APPLICATION' ? this.nouvelleReclamation.logicielConcerne : undefined,
      detailsPanne: this.nouvelleReclamation.detailsPanne,
      criticite: this.nouvelleReclamation.criticite,
      dateCreation: 'À l\'instant',
      statut: 'TRANSMIS_SD_TIC',
      statutLabel: 'Transmis au SD-TIC (En attente d\'affectation)',
      reponseTechnique: 'Votre demande a été enregistrée dans la file d\'assistance de la CRE.'
    };

    this.reclamationsList.unshift(newTicket);
    this.showModalReclamation = false;
    this.afficherToast('✅ Votre réclamation a bien été transmise au SD-TIC de la CRE avec succès !');
  }

  getCategorieLabel(cat: 'MATERIEL' | 'LOGICIEL_APPLICATION' | 'RESEAU_LOCAL_CRE'): string {
    switch (cat) {
      case 'MATERIEL': return 'Panne Matérielle (Équipement)';
      case 'LOGICIEL_APPLICATION': return 'Panne Logicielle / Application Métier';
      case 'RESEAU_LOCAL_CRE': return 'Réseau Local CRE (LAN / Connectivité)';
    }
  }

  marquerTache(tache: TacheDeleguee, nouveauStatut: 'EN_COURS' | 'TERMINEE'): void {
    tache.statut = nouveauStatut;
    this.afficherToast(`✅ Tâche "${tache.titre}" mise à jour : ${nouveauStatut === 'TERMINEE' ? 'Clôturée' : 'En cours'}`);
  }

  afficherToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = '';
    }, 4500);
  }
}
