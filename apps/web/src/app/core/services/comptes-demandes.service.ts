import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PersonnelCreRecord {
  matricule: string;
  cin: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  etablissementOuSiege: string;
  roleActuel: string;
}

export interface DemandeCompteElissaEdunet {
  id: string;
  codeDemande: string;
  typePlateforme: 'ELISSA' | 'EDUNET';
  // Données de base (auto-remplies si personnel enregistré en base)
  matricule: string;
  cin: string;
  nomDemandeur: string;
  prenomDemandeur: string;
  emailDemandeur: string;
  telephoneDemandeur: string;
  creOrigine: string;
  etablissementOuSiege: string;
  // Champs spécifiques obligatoires pour le site ELISSA
  tacheActuelle?: string;
  tachePrecedente?: string;
  lieuPrecedent?: string;
  chefDirectActuel?: string;
  // Champs spécifiques pour le portail EDUNET
  roleEdunetDemande?: string;
  // Pièces jointes scannées ou PDF obligatoires (Elissa)
  pieceJointeCinNom?: string;
  pieceJointeCinTaille?: string;
  pieceJointeArreteNom?: string;
  pieceJointeArreteTaille?: string;
  // Circuit de validation
  dateDemande: string;
  dateValidationSdTic?: string;
  sdticNomValidateur?: string;
  adjointAssigneId?: string;
  adjointAssigneNom?: string;
  statut: 'EN_ATTENTE_SD_TIC' | 'ACHEMINEE_ADMIN_ADJOINT' | 'APPROUVEE_CREEE' | 'REJETEE';
  statutLabel: string;
  // Données du compte généré par l'Admin Adjoint
  identifiantGenere?: string;
  motDePasseProvisoire?: string;
  dateCloture?: string;
  motifRejet?: string;
}

export interface AdminAdjointCompte {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  actif: boolean;
  tachesAutorisees: {
    arrivages: boolean;
    inventaires: boolean;
    pannesPertes: boolean;
    comptesLocaux: boolean;
    rapports: boolean;
    comptesElissaEdunet: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ComptesDemandesService {
  // Référentiel des personnels du CRE enregistrés en base pour auto-remplissage rapide
  public personnelsBase: PersonnelCreRecord[] = [
    {
      matricule: 'ADM-7101',
      cin: '08459123',
      nom: 'Ben Abdallah',
      prenom: 'Najla',
      email: 'najla.benabdallah@edunet.tn',
      telephone: '+216 98 230 451',
      etablissementOuSiege: 'Siège Central CRE Manouba (Coordination Pédagogique)',
      roleActuel: 'Agent Administratif Pédagogique'
    },
    {
      matricule: 'DIR-3001',
      cin: '05128944',
      nom: 'Ben Salem',
      prenom: 'Moncef',
      email: 'directeur.ibnabidhiaf@edunet.tn',
      telephone: '+216 98 600 120',
      etablissementOuSiege: 'Lycée Ibn Abi Dhiaf - Manouba',
      roleActuel: 'Directeur d\'Établissement Secondaire'
    },
    {
      matricule: 'PRF-4001',
      cin: '07119043',
      nom: 'Mansour',
      prenom: 'Sami',
      email: 'prof.sami@edunet.tn',
      telephone: '+216 97 114 890',
      etablissementOuSiege: 'Lycée Ibn Abi Dhiaf - Manouba',
      roleActuel: 'Professeur Principal Émérite TIC'
    },
    {
      matricule: 'ADM-7105',
      cin: '06883210',
      nom: 'Dridi',
      prenom: 'Mounir',
      email: 'mounir.dridi@edunet.tn',
      telephone: '+216 95 330 219',
      etablissementOuSiege: 'CREFOC Manouba (Centre de Formation)',
      roleActuel: 'Gestionnaire Logistique Stagiaires'
    },
    {
      matricule: 'SEC-5101',
      cin: '04918234',
      nom: 'Mansour',
      prenom: 'Zouhair',
      email: 'sg.manouba@edunet.tn',
      telephone: '+216 71 600 500',
      etablissementOuSiege: 'Siège Central CRE Manouba',
      roleActuel: 'Secrétaire Général du CRE'
    },
    {
      matricule: 'EXA-6101',
      cin: '06223401',
      nom: 'Trabelsi',
      prenom: 'Chokri',
      email: 'examens.manouba@edunet.tn',
      telephone: '+216 98 440 331',
      etablissementOuSiege: 'Direction des Examens & Concours (CRE Manouba)',
      roleActuel: 'Responsable Régional des Épreuves du Bac'
    }
  ];

  // Liste des Admin Adjoints du Ministère avec leurs attributions
  private adjointsSubject = new BehaviorSubject<AdminAdjointCompte[]>([
    {
      id: 'ADJ-01',
      matricule: 'ADJ-1002',
      nom: 'Ben Romdhane',
      prenom: 'Fatma',
      email: 'adjoint1@edunet.tn',
      telephone: '+216 71 568 200',
      actif: true,
      tachesAutorisees: {
        arrivages: false,
        inventaires: true,
        pannesPertes: false,
        comptesLocaux: false,
        rapports: true,
        comptesElissaEdunet: true // Habilitée Elissa & Edunet
      }
    },
    {
      id: 'ADJ-02',
      matricule: 'ADJ-1003',
      nom: 'Mezghani',
      prenom: 'Tarek',
      email: 'adjoint2@edunet.tn',
      telephone: '+216 71 568 201',
      actif: true,
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
      nom: 'Bouzidi',
      prenom: 'Rim',
      email: 'adjoint3@edunet.tn',
      telephone: '+216 71 568 202',
      actif: true,
      tachesAutorisees: {
        arrivages: false,
        inventaires: true,
        pannesPertes: false,
        comptesLocaux: false,
        rapports: true,
        comptesElissaEdunet: true // Habilitée Elissa & Edunet
      }
    }
  ]);
  public adjoints$ = this.adjointsSubject.asObservable();

  // Liste des demandes de comptes Elissa et Edunet
  private demandesSubject = new BehaviorSubject<DemandeCompteElissaEdunet[]>([
    {
      id: 'DEM-001',
      codeDemande: 'ELISSA-2026-0084',
      typePlateforme: 'ELISSA',
      matricule: 'ADM-7101',
      cin: '08459123',
      nomDemandeur: 'Ben Abdallah',
      prenomDemandeur: 'Najla',
      emailDemandeur: 'najla.benabdallah@edunet.tn',
      telephoneDemandeur: '+216 98 230 451',
      creOrigine: 'CRE Manouba',
      etablissementOuSiege: 'Siège Central CRE Manouba',
      tacheActuelle: 'Gestionnaire des états financiers et bourses scolaires',
      tachePrecedente: 'Adjointe d\'intendance',
      lieuPrecedent: 'Lycée Ibn Abi Dhiaf',
      chefDirectActuel: 'M. Zouhair Mansour (Secrétaire Général CRE)',
      pieceJointeCinNom: 'CIN_BenAbdallah_Najla_08459123.pdf',
      pieceJointeCinTaille: '1.2 Mo',
      pieceJointeArreteNom: 'Arrete_Nomination_Gestion_Financiere_2026.pdf',
      pieceJointeArreteTaille: '2.4 Mo',
      dateDemande: '26/10/2026',
      dateValidationSdTic: '27/10/2026 09:15',
      sdticNomValidateur: 'Mohamed Gharbi (SD TIC)',
      adjointAssigneId: 'ADJ-01',
      adjointAssigneNom: 'Fatma Ben Romdhane',
      statut: 'ACHEMINEE_ADMIN_ADJOINT',
      statutLabel: 'Validée par le SD-TIC · Acheminée à l\'Admin Adjoint (Ministère)'
    },
    {
      id: 'DEM-002',
      codeDemande: 'EDUNET-2026-0112',
      typePlateforme: 'EDUNET',
      matricule: 'PRF-4001',
      cin: '07119043',
      nomDemandeur: 'Mansour',
      prenomDemandeur: 'Sami',
      emailDemandeur: 'prof.sami@edunet.tn',
      telephoneDemandeur: '+216 97 114 890',
      creOrigine: 'CRE Manouba',
      etablissementOuSiege: 'Lycée Ibn Abi Dhiaf - Manouba',
      roleEdunetDemande: 'Professeur TIC & Responsable Épreuves Pratiques Bac',
      dateDemande: '27/10/2026',
      statut: 'EN_ATTENTE_SD_TIC',
      statutLabel: 'En attente d\'examen et validation par le SD-TIC'
    },
    {
      id: 'DEM-003',
      codeDemande: 'ELISSA-2026-0071',
      typePlateforme: 'ELISSA',
      matricule: 'EXA-6101',
      cin: '06223401',
      nomDemandeur: 'Trabelsi',
      prenomDemandeur: 'Chokri',
      emailDemandeur: 'examens.manouba@edunet.tn',
      telephoneDemandeur: '+216 98 440 331',
      creOrigine: 'CRE Manouba',
      etablissementOuSiege: 'Direction des Examens (CRE Manouba)',
      tacheActuelle: 'Chef de Centre Tirage & Gestionnaire des centres d\'examens',
      tachePrecedente: 'Coordinateur des épreuves écrites',
      lieuPrecedent: 'Siège CRE Manouba',
      chefDirectActuel: 'M. Zouhair Mansour (Secrétaire Général)',
      pieceJointeCinNom: 'CIN_Chokri_Trabelsi_Scan.pdf',
      pieceJointeCinTaille: '850 Ko',
      pieceJointeArreteNom: 'Decision_Ministerielle_Examens_2026.pdf',
      pieceJointeArreteTaille: '1.9 Mo',
      dateDemande: '24/10/2026',
      dateValidationSdTic: '24/10/2026 14:00',
      sdticNomValidateur: 'Mohamed Gharbi (SD TIC)',
      adjointAssigneId: 'ADJ-01',
      adjointAssigneNom: 'Fatma Ben Romdhane',
      statut: 'APPROUVEE_CREEE',
      statutLabel: 'Compte Officiel Créé & Notifié au Demandeur',
      identifiantGenere: 'elissa_ctrabelsi_cre01',
      motDePasseProvisoire: 'Elissa@Bac2026!',
      dateCloture: '25/10/2026 11:30'
    }
  ]);
  public demandes$ = this.demandesSubject.asObservable();

  constructor() {}

  // Recherche un personnel par matricule ou CIN pour auto-remplir la demande
  trouverPersonnelParMatriculeOuCin(terme: string): PersonnelCreRecord | undefined {
    if (!terme || !terme.trim()) return undefined;
    const clean = terme.trim().toLowerCase();
    return this.personnelsBase.find(
      p => p.matricule.toLowerCase() === clean || p.cin.toLowerCase() === clean
    );
  }

  // 1. Soumission d'une nouvelle demande (Elissa ou Edunet)
  soumettreDemande(demande: Partial<DemandeCompteElissaEdunet>): DemandeCompteElissaEdunet {
    const isElissa = demande.typePlateforme === 'ELISSA';
    const count = this.demandesSubject.value.length + 1;
    const prefix = isElissa ? 'ELISSA' : 'EDUNET';
    const code = `${prefix}-2026-${String(count).padStart(4, '0')}`;

    const newDemande: DemandeCompteElissaEdunet = {
      id: 'DEM-' + Date.now(),
      codeDemande: code,
      typePlateforme: demande.typePlateforme || 'ELISSA',
      matricule: demande.matricule || '',
      cin: demande.cin || '',
      nomDemandeur: demande.nomDemandeur || '',
      prenomDemandeur: demande.prenomDemandeur || '',
      emailDemandeur: demande.emailDemandeur || '',
      telephoneDemandeur: demande.telephoneDemandeur || '',
      creOrigine: demande.creOrigine || 'CRE Manouba',
      etablissementOuSiege: demande.etablissementOuSiege || '',
      tacheActuelle: demande.tacheActuelle,
      tachePrecedente: demande.tachePrecedente,
      lieuPrecedent: demande.lieuPrecedent,
      chefDirectActuel: demande.chefDirectActuel,
      roleEdunetDemande: demande.roleEdunetDemande,
      pieceJointeCinNom: demande.pieceJointeCinNom || (isElissa ? `CIN_${demande.matricule}.pdf` : undefined),
      pieceJointeCinTaille: demande.pieceJointeCinTaille || '1.1 Mo',
      pieceJointeArreteNom: demande.pieceJointeArreteNom || (isElissa ? `Arrete_Nomination_${demande.matricule}.pdf` : undefined),
      pieceJointeArreteTaille: demande.pieceJointeArreteTaille || '2.0 Mo',
      dateDemande: new Date().toLocaleDateString('fr-FR'),
      statut: 'EN_ATTENTE_SD_TIC',
      statutLabel: 'En attente d\'examen et validation par le SD-TIC'
    };

    const updated = [newDemande, ...this.demandesSubject.value];
    this.demandesSubject.next(updated);
    return newDemande;
  }

  // 2. Validation par le SD-TIC et acheminement vers l'Admin Adjoint habilité
  validerEtAcheminerParSdTic(
    demandeId: string, 
    sdticNom: string, 
    adjointAssigne: AdminAdjointCompte
  ): void {
    const list = this.demandesSubject.value;
    const target = list.find(d => d.id === demandeId);
    if (!target) return;

    target.statut = 'ACHEMINEE_ADMIN_ADJOINT';
    target.statutLabel = `Validée par le SD-TIC · Acheminée à ${target.typePlateforme === 'ELISSA' ? 'l\'Admin Adjoint Elissa' : 'l\'Admin Adjoint Edunet'} (${adjointAssigne.prenom} ${adjointAssigne.nom})`;
    target.dateValidationSdTic = new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    target.sdticNomValidateur = sdticNom;
    target.adjointAssigneId = adjointAssigne.id;
    target.adjointAssigneNom = `${adjointAssigne.prenom} ${adjointAssigne.nom}`;

    this.demandesSubject.next([...list]);
  }

  // 3. Approbation et création du compte par l'Admin Adjoint (ou Admin Central)
  approuverEtGenererCompte(
    demandeId: string, 
    identifiant: string, 
    motDePasse: string
  ): void {
    const list = this.demandesSubject.value;
    const target = list.find(d => d.id === demandeId);
    if (!target) return;

    target.statut = 'APPROUVEE_CREEE';
    target.statutLabel = 'Compte Officiel Créé & Transmis au Demandeur';
    target.identifiantGenere = identifiant;
    target.motDePasseProvisoire = motDePasse;
    target.dateCloture = new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    this.demandesSubject.next([...list]);
  }

  // 4. Rejet d'une demande avec motif
  rejeterDemande(demandeId: string, motif: string): void {
    const list = this.demandesSubject.value;
    const target = list.find(d => d.id === demandeId);
    if (!target) return;

    target.statut = 'REJETEE';
    target.statutLabel = 'Demande Rejetée / Pièces Manquantes';
    target.motifRejet = motif;
    target.dateCloture = new Date().toLocaleDateString('fr-FR');

    this.demandesSubject.next([...list]);
  }

  // 5. Gestion des Admin Adjoints par l'Admin Central : Création d'un nouveau compte adjoint
  ajouterAdminAdjoint(nouveau: {
    matricule: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    tachesAutorisees: AdminAdjointCompte['tachesAutorisees'];
  }): AdminAdjointCompte {
    const adjoints = this.adjointsSubject.value;
    const id = `ADJ-${String(adjoints.length + 1).padStart(2, '0')}`;
    const compte: AdminAdjointCompte = {
      id,
      matricule: nouveau.matricule,
      nom: nouveau.nom,
      prenom: nouveau.prenom,
      email: nouveau.email,
      telephone: nouveau.telephone,
      actif: true,
      tachesAutorisees: nouveau.tachesAutorisees
    };

    this.adjointsSubject.next([...adjoints, compte]);
    return compte;
  }

  // 6. Mise à jour complète des informations et tâches d'un adjoint par l'Admin Central
  modifierAdminAdjoint(adjointId: string, donnees: {
    matricule?: string;
    nom?: string;
    prenom?: string;
    email?: string;
    telephone?: string;
    actif?: boolean;
    tachesAutorisees?: AdminAdjointCompte['tachesAutorisees'];
  }): void {
    const adjoints = this.adjointsSubject.value;
    const target = adjoints.find(a => a.id === adjointId);
    if (target) {
      if (donnees.matricule !== undefined) target.matricule = donnees.matricule;
      if (donnees.nom !== undefined) target.nom = donnees.nom;
      if (donnees.prenom !== undefined) target.prenom = donnees.prenom;
      if (donnees.email !== undefined) target.email = donnees.email;
      if (donnees.telephone !== undefined) target.telephone = donnees.telephone;
      if (donnees.actif !== undefined) target.actif = donnees.actif;
      if (donnees.tachesAutorisees !== undefined) target.tachesAutorisees = { ...donnees.tachesAutorisees };
      this.adjointsSubject.next([...adjoints]);
    }
  }

  // 7. Suppression d'un compte adjoint par l'Admin Central
  supprimerAdminAdjoint(adjointId: string): void {
    const filtered = this.adjointsSubject.value.filter(a => a.id !== adjointId);
    this.adjointsSubject.next(filtered);
  }

  // 8. Activation / Désactivation d'un adjoint
  toggleAdminAdjointStatut(adjointId: string): boolean {
    const adjoints = this.adjointsSubject.value;
    const target = adjoints.find(a => a.id === adjointId);
    if (target) {
      target.actif = !target.actif;
      this.adjointsSubject.next([...adjoints]);
      return target.actif;
    }
    return false;
  }

  // 9. Mise à jour des tâches d'un adjoint par l'Admin Central
  modifierTachesAdjoint(adjointId: string, nouvellesTaches: AdminAdjointCompte['tachesAutorisees']): void {
    const adjoints = this.adjointsSubject.value;
    const target = adjoints.find(a => a.id === adjointId);
    if (target) {
      target.tachesAutorisees = { ...nouvellesTaches };
      this.adjointsSubject.next([...adjoints]);
    }
  }

  // Retourne les adjoints habilités pour la gestion des comptes Elissa/Edunet
  getAdjointsHabilitesComptes(): AdminAdjointCompte[] {
    return this.adjointsSubject.value.filter(a => a.actif && a.tachesAutorisees.comptesElissaEdunet);
  }
}
