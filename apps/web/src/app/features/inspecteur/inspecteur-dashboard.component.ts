import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserAccount } from '../../core/services/auth.service';
import { FirebaseService } from '../../core/services/firebase.service';

export interface EtablissementInventaire {
  id: string;
  nom: string;
  code: string;
  type: string;
  delegation: string;
  nombreLabos: number;
  totalPcFixes: number;
  pcFixesEnPanne: number;
  totalPcPortables: number;
  pcPortablesEnPanne: number;
  totalServeurs: number;
  serveursEnPanne: number;
  totalSwitchs: number;
  totalOnduleurs: number;
  totalVideoprojecteurs: number;
  statutConformiteBac: 'CONFORME' | 'VIGILANCE' | 'NON_CONFORME';
  observationsInspection: string;
  derniereInspectionDate: string;
}

export interface LaboPreparationBac {
  id: string;
  etablissementId: string;
  etablissementNom: string;
  nomLabo: string;
  capacitePostes: number;
  postesSecours: number;
  // RÈGLE STRICTE : 1 SEUL PROFESSEUR RESPONSABLE PAR LABO
  profResponsableNom: string;
  profResponsableMatricule: string;
  profResponsableTel: string;
  dateDesignation: string;
  imageSystemeInstallee: boolean;
  isolationInternetValidee: boolean;
  compilateursPrets: boolean; // Python 3.11, VS Code, Thonny, MySQL
  onduleurVerifie: boolean;
  statutPreparation: 'PRET_VALIDE' | 'EN_COURS' | 'BLOQUE';
  visaInspecteurDate?: string;
  remarquesInspecteur?: string;
}

export interface EnseignantVivier {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  etablissementOrigine: string;
  specialite: string;
  grade: string;
  anciennete: number;
  telephone: string;
  statutActuel: 'DISPONIBLE' | 'AFFECTE_SURVEILLANCE' | 'AFFECTE_RESERVE' | 'COORDINATEUR' | 'CORRECTEUR';
}

export interface AffectationBacJour {
  id: string;
  sessionBac: 'SESSION_PRINCIPALE' | 'SESSION_CONTROLE';
  dateJour: string; // ex: '2026-05-18'
  jourLibelle: string; // ex: 'Lundi 18 Mai 2026'
  seanceHoraire: string; // ex: '08h00 - 10h00 (Séance 1)'
  etablissementNom: string;
  laboNom: string;
  // 2 surveillants titulaires par labo
  surveillantsTitulaires: { matricule: string; nomPrenom: string; etablissement: string }[];
  // Surveillant de réserve associé
  surveillantReserve?: { matricule: string; nomPrenom: string; etablissement: string };
  // Professeur Coordinateur de centre
  profCoordinateur: { matricule: string; nomPrenom: string; etablissement: string; tel: string };
  // Professeurs Correcteurs désignés
  profsCorrecteurs: { matricule: string; nomPrenom: string; centreCorrection: string; quotaCopies: number }[];
  statutValidation: 'VALIDE_INSPECTEUR' | 'BROUILLON';
}

@Component({
  selector: 'app-inspecteur-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inspecteur-dashboard.component.html',
  styleUrls: ['./inspecteur-dashboard.component.scss']
})
export class InspecteurDashboardComponent implements OnInit {
  currentUser: UserAccount | null = null;
  activeTab: 'inventaires' | 'preparation' | 'repartition' | 'pv' = 'preparation';

  // Filtres
  selectedCreNom = 'CRE Manouba';
  listeCre26: string[] = [
    'CRE Manouba', 'CRE Tunis 1', 'CRE Tunis 2', 'CRE Ariana', 'CRE Ben Arous',
    'CRE Bizerte', 'CRE Nabeul', 'CRE Zaghouan', 'CRE Béja', 'CRE Jendouba',
    'CRE Le Kef', 'CRE Siliana', 'CRE Sousse', 'CRE Monastir', 'CRE Mahdia',
    'CRE Sfax 1', 'CRE Sfax 2', 'CRE Kairouan', 'CRE Kasserine', 'CRE Sidi Bouzid',
    'CRE Gabès', 'CRE Médenine', 'CRE Tataouine', 'CRE Gafsa', 'CRE Tozeur', 'CRE Kébili'
  ];

  selectedEtablissementId = 'ETAB-101';
  toastMessage = '';

  // 1. Inventaires Équipements par Établissement
  etablissements: EtablissementInventaire[] = [
    {
      id: 'ETAB-101',
      nom: 'Lycée Ibn Abi Dhiaf - Manouba',
      code: 'LYC-MAN-01',
      type: 'Lycée Secondaire',
      delegation: 'Manouba Centre',
      nombreLabos: 3,
      totalPcFixes: 48,
      pcFixesEnPanne: 2,
      totalPcPortables: 6,
      pcPortablesEnPanne: 1,
      totalServeurs: 3,
      serveursEnPanne: 0,
      totalSwitchs: 4,
      totalOnduleurs: 3,
      totalVideoprojecteurs: 3,
      statutConformiteBac: 'CONFORME',
      observationsInspection: 'Parc informatique en excellent état. 2 postes élèves en attente de remplacement d\'alimentations par le SD-TIC.',
      derniereInspectionDate: '24/10/2026'
    },
    {
      id: 'ETAB-102',
      nom: 'Lycée Asad Ibn El Fourat - Oued Ellil',
      code: 'LYC-OED-02',
      type: 'Lycée Secondaire',
      delegation: 'Oued Ellil',
      nombreLabos: 2,
      totalPcFixes: 34,
      pcFixesEnPanne: 3,
      totalPcPortables: 4,
      pcPortablesEnPanne: 1,
      totalServeurs: 2,
      serveursEnPanne: 0,
      totalSwitchs: 2,
      totalOnduleurs: 2,
      totalVideoprojecteurs: 2,
      statutConformiteBac: 'VIGILANCE',
      observationsInspection: 'Switch Labo 2 à contrôler avec l\'équipe mobile. Image système validée.',
      derniereInspectionDate: '18/10/2026'
    },
    {
      id: 'ETAB-103',
      nom: 'Lycée Pilote de Manouba',
      code: 'LYC-PIL-03',
      type: 'Lycée Pilote',
      delegation: 'Denden / Manouba',
      nombreLabos: 4,
      totalPcFixes: 64,
      pcFixesEnPanne: 0,
      totalPcPortables: 8,
      pcPortablesEnPanne: 0,
      totalServeurs: 4,
      serveursEnPanne: 0,
      totalSwitchs: 5,
      totalOnduleurs: 4,
      totalVideoprojecteurs: 4,
      statutConformiteBac: 'CONFORME',
      observationsInspection: 'Infrastructure modèle. Parfaite conformité pour l\'ensemble des épreuves du Bac.',
      derniereInspectionDate: '26/10/2026'
    },
    {
      id: 'ETAB-104',
      nom: 'Lycée Mornaguia',
      code: 'LYC-MOR-04',
      type: 'Lycée Secondaire',
      delegation: 'Mornaguia',
      nombreLabos: 2,
      totalPcFixes: 30,
      pcFixesEnPanne: 4,
      totalPcPortables: 3,
      pcPortablesEnPanne: 2,
      totalServeurs: 2,
      serveursEnPanne: 1,
      totalSwitchs: 2,
      totalOnduleurs: 2,
      totalVideoprojecteurs: 2,
      statutConformiteBac: 'NON_CONFORME',
      observationsInspection: 'Serveur local d\'épreuve en panne. Intervention d\'urgence planifiée auprès du SD-TIC.',
      derniereInspectionDate: '21/10/2026'
    }
  ];

  // 2. Préparation du Bac Pratique (RÈGLE : 1 SEUL PROF PAR LABO)
  labosPreparation: LaboPreparationBac[] = [
    {
      id: 'LAB-PREP-01',
      etablissementId: 'ETAB-101',
      etablissementNom: 'Lycée Ibn Abi Dhiaf - Manouba',
      nomLabo: 'Laboratoire Informatique 1 (Labo Principal Bac)',
      capacitePostes: 16,
      postesSecours: 2,
      profResponsableNom: 'Sami Mansour',
      profResponsableMatricule: 'PRF-4001',
      profResponsableTel: '+216 98 412 780',
      dateDesignation: '15/10/2026',
      imageSystemeInstallee: true,
      isolationInternetValidee: true,
      compilateursPrets: true,
      onduleurVerifie: true,
      statutPreparation: 'PRET_VALIDE',
      visaInspecteurDate: '28/10/2026',
      remarquesInspecteur: 'Labo 1 certifié prêt pour l\'épreuve pratique. Environnement Python 3.11 et MySQL impeccables.'
    },
    {
      id: 'LAB-PREP-02',
      etablissementId: 'ETAB-101',
      etablissementNom: 'Lycée Ibn Abi Dhiaf - Manouba',
      nomLabo: 'Laboratoire Informatique 2',
      capacitePostes: 16,
      postesSecours: 2,
      profResponsableNom: 'Mounir Chaabane',
      profResponsableMatricule: 'PRF-4015',
      profResponsableTel: '+216 97 325 119',
      dateDesignation: '15/10/2026',
      imageSystemeInstallee: true,
      isolationInternetValidee: true,
      compilateursPrets: true,
      onduleurVerifie: false,
      statutPreparation: 'EN_COURS',
      remarquesInspecteur: 'Vérifier l\'autonomie de l\'onduleur 1500VA avant visa définitif.'
    },
    {
      id: 'LAB-PREP-03',
      etablissementId: 'ETAB-102',
      etablissementNom: 'Lycée Asad Ibn El Fourat - Oued Ellil',
      nomLabo: 'Labo Informatique A (Centre Oued Ellil)',
      capacitePostes: 16,
      postesSecours: 2,
      profResponsableNom: 'Leila Gharbi',
      profResponsableMatricule: 'PRF-4022',
      profResponsableTel: '+216 96 114 883',
      dateDesignation: '16/10/2026',
      imageSystemeInstallee: true,
      isolationInternetValidee: true,
      compilateursPrets: false,
      onduleurVerifie: true,
      statutPreparation: 'EN_COURS',
      remarquesInspecteur: 'Finaliser l\'installation de Thonny IDE et tester les scripts de vérification.'
    },
    {
      id: 'LAB-PREP-04',
      etablissementId: 'ETAB-103',
      etablissementNom: 'Lycée Pilote de Manouba',
      nomLabo: 'Laboratoire Informatique Numérique 1',
      capacitePostes: 18,
      postesSecours: 3,
      profResponsableNom: 'Anis Ben Fredj',
      profResponsableMatricule: 'PRF-4030',
      profResponsableTel: '+216 99 874 521',
      dateDesignation: '14/10/2026',
      imageSystemeInstallee: true,
      isolationInternetValidee: true,
      compilateursPrets: true,
      onduleurVerifie: true,
      statutPreparation: 'PRET_VALIDE',
      visaInspecteurDate: '27/10/2026',
      remarquesInspecteur: 'Labo 100% conforme. 3 postes de réserve testés et validés.'
    }
  ];

  // 3. Vivier des Enseignants d'Informatique pour la Répartition
  enseignantsVivier: EnseignantVivier[] = [
    { id: 'ENS-01', matricule: 'PRF-4001', nom: 'Mansour', prenom: 'Sami', etablissementOrigine: 'Lycée Ibn Abi Dhiaf', specialite: 'Informatique', grade: 'Professeur Principal Hors Classe', anciennete: 18, telephone: '+216 98 412 780', statutActuel: 'COORDINATEUR' },
    { id: 'ENS-02', matricule: 'PRF-4015', nom: 'Chaabane', prenom: 'Mounir', etablissementOrigine: 'Lycée Ibn Abi Dhiaf', specialite: 'Informatique & Algorithmique', grade: 'Professeur Principal', anciennete: 12, telephone: '+216 97 325 119', statutActuel: 'AFFECTE_SURVEILLANCE' },
    { id: 'ENS-03', matricule: 'PRF-4022', nom: 'Gharbi', prenom: 'Leila', etablissementOrigine: 'Lycée Asad Ibn El Fourat', specialite: 'Informatique & TIC', grade: 'Professeur Principal', anciennete: 14, telephone: '+216 96 114 883', statutActuel: 'CORRECTEUR' },
    { id: 'ENS-04', matricule: 'PRF-4030', nom: 'Ben Fredj', prenom: 'Anis', etablissementOrigine: 'Lycée Pilote Manouba', specialite: 'Informatique', grade: 'Professeur Émérite', anciennete: 21, telephone: '+216 99 874 521', statutActuel: 'CORRECTEUR' },
    { id: 'ENS-05', matricule: 'PRF-4041', nom: 'Dridi', prenom: 'Houda', etablissementOrigine: 'Lycée Mornaguia', specialite: 'Informatique', grade: 'Professeur', anciennete: 8, telephone: '+216 95 620 334', statutActuel: 'AFFECTE_SURVEILLANCE' },
    { id: 'ENS-06', matricule: 'PRF-4055', nom: 'Mejri', prenom: 'Zouhair', etablissementOrigine: 'Lycée Oued Ellil', specialite: 'Informatique', grade: 'Professeur Principal', anciennete: 11, telephone: '+216 94 771 209', statutActuel: 'AFFECTE_RESERVE' },
    { id: 'ENS-07', matricule: 'PRF-4062', nom: 'Hammami', prenom: 'Nadia', etablissementOrigine: 'Lycée Denden', specialite: 'Informatique & Réseaux', grade: 'Professeur', anciennete: 9, telephone: '+216 93 456 781', statutActuel: 'AFFECTE_SURVEILLANCE' },
    { id: 'ENS-08', matricule: 'PRF-4070', nom: 'Bouazizi', prenom: 'Karim', etablissementOrigine: 'Collège Pilote Manouba', specialite: 'Informatique', grade: 'Professeur Principal', anciennete: 13, telephone: '+216 92 110 994', statutActuel: 'AFFECTE_RESERVE' },
    { id: 'ENS-09', matricule: 'PRF-4084', nom: 'Kouki', prenom: 'Amel', etablissementOrigine: 'Lycée Borj El Amri', specialite: 'Informatique', grade: 'Professeur Principal', anciennete: 15, telephone: '+216 97 800 321', statutActuel: 'CORRECTEUR' }
  ];

  // 4. Répartition des Journées & Séances du Bac Pratique
  joursBac: { date: string; libelle: string }[] = [
    { date: '2026-05-18', libelle: 'Lundi 18 Mai 2026 (Jour 1)' },
    { date: '2026-05-19', libelle: 'Mardi 19 Mai 2026 (Jour 2)' },
    { date: '2026-05-20', libelle: 'Mercredi 20 Mai 2026 (Jour 3)' },
    { date: '2026-05-21', libelle: 'Jeudi 21 Mai 2026 (Jour 4)' },
    { date: '2026-05-22', libelle: 'Vendredi 22 Mai 2026 (Jour 5)' },
    { date: '2026-05-23', libelle: 'Samedi 23 Mai 2026 (Jour 6 - Rattrapages techniques)' }
  ];

  selectedJourDate = '2026-05-18';
  selectedSeance = '08h00 - 10h00 (Séance 1)';

  affectations: AffectationBacJour[] = [
    {
      id: 'AFF-01',
      sessionBac: 'SESSION_PRINCIPALE',
      dateJour: '2026-05-18',
      jourLibelle: 'Lundi 18 Mai 2026 (Jour 1)',
      seanceHoraire: '08h00 - 10h00 (Séance 1)',
      etablissementNom: 'Lycée Ibn Abi Dhiaf - Manouba',
      laboNom: 'Laboratoire Informatique 1',
      surveillantsTitulaires: [
        { matricule: 'PRF-4015', nomPrenom: 'Mounir Chaabane', etablissement: 'Lycée Ibn Abi Dhiaf' },
        { matricule: 'PRF-4062', nomPrenom: 'Nadia Hammami', etablissement: 'Lycée Denden' }
      ],
      surveillantReserve: { matricule: 'PRF-4055', nomPrenom: 'Zouhair Mejri', etablissement: 'Lycée Oued Ellil' },
      profCoordinateur: { matricule: 'PRF-4001', nomPrenom: 'Sami Mansour', etablissement: 'Lycée Ibn Abi Dhiaf', tel: '+216 98 412 780' },
      profsCorrecteurs: [
        { matricule: 'PRF-4022', nomPrenom: 'Leila Gharbi', centreCorrection: 'Centre de Correction Lycée Pilote Manouba', quotaCopies: 75 },
        { matricule: 'PRF-4030', nomPrenom: 'Anis Ben Fredj', centreCorrection: 'Centre de Correction Lycée Pilote Manouba', quotaCopies: 80 }
      ],
      statutValidation: 'VALIDE_INSPECTEUR'
    },
    {
      id: 'AFF-02',
      sessionBac: 'SESSION_PRINCIPALE',
      dateJour: '2026-05-18',
      jourLibelle: 'Lundi 18 Mai 2026 (Jour 1)',
      seanceHoraire: '10h30 - 12h30 (Séance 2)',
      etablissementNom: 'Lycée Ibn Abi Dhiaf - Manouba',
      laboNom: 'Laboratoire Informatique 1',
      surveillantsTitulaires: [
        { matricule: 'PRF-4041', nomPrenom: 'Houda Dridi', etablissement: 'Lycée Mornaguia' },
        { matricule: 'PRF-4062', nomPrenom: 'Nadia Hammami', etablissement: 'Lycée Denden' }
      ],
      surveillantReserve: { matricule: 'PRF-4070', nomPrenom: 'Karim Bouazizi', etablissement: 'Collège Pilote Manouba' },
      profCoordinateur: { matricule: 'PRF-4001', nomPrenom: 'Sami Mansour', etablissement: 'Lycée Ibn Abi Dhiaf', tel: '+216 98 412 780' },
      profsCorrecteurs: [
        { matricule: 'PRF-4084', nomPrenom: 'Amel Kouki', centreCorrection: 'Centre de Correction Lycée Pilote Manouba', quotaCopies: 70 }
      ],
      statutValidation: 'VALIDE_INSPECTEUR'
    }
  ];

  // Modale pour affecter un prof coordinateur ou un surveillant
  showAddAffectationModal = false;
  newAffectation = {
    etablissementNom: 'Lycée Ibn Abi Dhiaf - Manouba',
    laboNom: 'Laboratoire Informatique 1',
    dateJour: '2026-05-18',
    seanceHoraire: '08h00 - 10h00 (Séance 1)',
    surveillant1Matricule: '',
    surveillant2Matricule: '',
    reserveMatricule: '',
    coordinateurMatricule: 'PRF-4001',
    correcteurMatricule: 'PRF-4030',
    quotaCopies: 60
  };

  // Modale désignation 1 seul prof par labo
  showDesignationModal = false;
  selectedLaboForDesignation: LaboPreparationBac | null = null;
  selectedProfMatriculeForLabo = '';

  constructor(
    private authService: AuthService,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadPersistedData();
  }

  loadPersistedData(): void {
    const savedPrep = localStorage.getItem('suivitic_inspecteur_preparation');
    if (savedPrep) {
      try { this.labosPreparation = JSON.parse(savedPrep); } catch (e) {}
    }
    const savedAff = localStorage.getItem('suivitic_inspecteur_affectations');
    if (savedAff) {
      try { this.affectations = JSON.parse(savedAff); } catch (e) {}
    }
  }

  saveData(): void {
    localStorage.setItem('suivitic_inspecteur_preparation', JSON.stringify(this.labosPreparation));
    localStorage.setItem('suivitic_inspecteur_affectations', JSON.stringify(this.affectations));
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => this.toastMessage = '', 4500);
  }

  get selectedEtablissement(): EtablissementInventaire | undefined {
    return this.etablissements.find(e => e.id === this.selectedEtablissementId) || this.etablissements[0];
  }

  get filteredAffectations(): AffectationBacJour[] {
    return this.affectations.filter(a => a.dateJour === this.selectedJourDate);
  }

  // Action : Viser et certifier un laboratoire conforme
  validerConformiteLabo(labo: LaboPreparationBac): void {
    if (!labo.imageSystemeInstallee || !labo.isolationInternetValidee || !labo.compilateursPrets) {
      this.showToast('⚠️ Impossible de valider : l\'image système, l\'isolation réseau et les compilateurs doivent impérativement être conformes !');
      return;
    }
    labo.statutPreparation = 'PRET_VALIDE';
    labo.visaInspecteurDate = new Date().toLocaleDateString('fr-TN');
    this.saveData();
    this.showToast(`✓ Visa officiel accordé pour le ${labo.nomLabo} (${labo.etablissementNom}) par l'Inspecteur.`);
  }

  // Ouvrir la modale de désignation exclusive (1 seul prof par labo)
  ouvrirDesignationProf(labo: LaboPreparationBac): void {
    this.selectedLaboForDesignation = labo;
    this.selectedProfMatriculeForLabo = labo.profResponsableMatricule;
    this.showDesignationModal = true;
  }

  // Valider la désignation d'un professeur responsable UNIQUE
  confirmerDesignationProf(): void {
    if (!this.selectedLaboForDesignation || !this.selectedProfMatriculeForLabo) return;

    const prof = this.enseignantsVivier.find(p => p.matricule === this.selectedProfMatriculeForLabo);
    if (!prof) return;

    // Règle d'or : Vérifier que ce professeur n'est pas déjà responsable d'un autre laboratoire
    const dejaAffecte = this.labosPreparation.find(
      l => l.profResponsableMatricule === prof.matricule && l.id !== this.selectedLaboForDesignation?.id
    );

    if (dejaAffecte) {
      alert(`⚠️ RÈGLE DE GESTION STRICTE DU BAC :\nLe professeur ${prof.prenom} ${prof.nom} est déjà désigné comme responsable unique pour le : ${dejaAffecte.nomLabo} (${dejaAffecte.etablissementNom}).\n\nChaque laboratoire doit avoir un professeur responsable distinct !`);
      return;
    }

    this.selectedLaboForDesignation.profResponsableNom = `${prof.prenom} ${prof.nom}`;
    this.selectedLaboForDesignation.profResponsableMatricule = prof.matricule;
    this.selectedLaboForDesignation.profResponsableTel = prof.telephone;
    this.selectedLaboForDesignation.dateDesignation = new Date().toLocaleDateString('fr-TN');

    this.saveData();
    this.showDesignationModal = false;
    this.showToast(`✓ Professeur ${prof.prenom} ${prof.nom} officiellement désigné comme responsable UNIQUE du ${this.selectedLaboForDesignation.nomLabo}.`);
  }

  // Ajouter une nouvelle affectation de séance
  ajouterAffectation(): void {
    if (!this.newAffectation.surveillant1Matricule || !this.newAffectation.surveillant2Matricule) {
      this.showToast('⚠️ Veuillez sélectionner au moins 2 professeurs surveillants titulaires pour ce laboratoire.');
      return;
    }

    if (this.newAffectation.surveillant1Matricule === this.newAffectation.surveillant2Matricule) {
      this.showToast('⚠️ Le premier et le second surveillant doivent être deux professeurs différents.');
      return;
    }

    const s1 = this.enseignantsVivier.find(e => e.matricule === this.newAffectation.surveillant1Matricule);
    const s2 = this.enseignantsVivier.find(e => e.matricule === this.newAffectation.surveillant2Matricule);
    const sReserve = this.enseignantsVivier.find(e => e.matricule === this.newAffectation.reserveMatricule);
    const coord = this.enseignantsVivier.find(e => e.matricule === this.newAffectation.coordinateurMatricule);
    const corr = this.enseignantsVivier.find(e => e.matricule === this.newAffectation.correcteurMatricule);

    const jourObj = this.joursBac.find(j => j.date === this.newAffectation.dateJour);

    const nouvelle: AffectationBacJour = {
      id: 'AFF-' + Date.now(),
      sessionBac: 'SESSION_PRINCIPALE',
      dateJour: this.newAffectation.dateJour,
      jourLibelle: jourObj ? jourObj.libelle : this.newAffectation.dateJour,
      seanceHoraire: this.newAffectation.seanceHoraire,
      etablissementNom: this.newAffectation.etablissementNom,
      laboNom: this.newAffectation.laboNom,
      surveillantsTitulaires: [
        { matricule: s1!.matricule, nomPrenom: `${s1!.prenom} ${s1!.nom}`, etablissement: s1!.etablissementOrigine },
        { matricule: s2!.matricule, nomPrenom: `${s2!.prenom} ${s2!.nom}`, etablissement: s2!.etablissementOrigine }
      ],
      surveillantReserve: sReserve ? { matricule: sReserve.matricule, nomPrenom: `${sReserve.prenom} ${sReserve.nom}`, etablissement: sReserve.etablissementOrigine } : undefined,
      profCoordinateur: {
        matricule: coord ? coord.matricule : 'PRF-4001',
        nomPrenom: coord ? `${coord.prenom} ${coord.nom}` : 'Sami Mansour',
        etablissement: coord ? coord.etablissementOrigine : 'Lycée Ibn Abi Dhiaf',
        tel: coord ? coord.telephone : '+216 98 412 780'
      },
      profsCorrecteurs: corr ? [{
        matricule: corr.matricule,
        nomPrenom: `${corr.prenom} ${corr.nom}`,
        centreCorrection: 'Centre de Correction Lycée Pilote Manouba',
        quotaCopies: this.newAffectation.quotaCopies || 75
      }] : [],
      statutValidation: 'VALIDE_INSPECTEUR'
    };

    this.affectations.push(nouvelle);
    this.saveData();
    this.showAddAffectationModal = false;
    this.showToast(`✓ Nouvelle affectation officielle validée pour le ${nouvelle.laboNom} (${nouvelle.seanceHoraire}).`);
  }

  supprimerAffectation(id: string): void {
    if (confirm('Confirmer la suppression de cette affectation d\'épreuve pratique ?')) {
      this.affectations = this.affectations.filter(a => a.id !== id);
      this.saveData();
      this.showToast('Affectation retirée avec succès.');
    }
  }

  imprimerPV(): void {
    window.print();
  }
}
