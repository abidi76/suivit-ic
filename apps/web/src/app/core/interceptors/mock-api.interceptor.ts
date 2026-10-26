import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';

const MOCK_STATS = {
  equipements: {
    total: 348,
    enService: 298,
    fonctionnels: 298,
    enPanne: 28,
    enAttenteConfirmation: 12,
    totalementEndommage: 6,
    perdus: 4,
    reformes: 18,
    tauxDisponibilite: 85.6
  },
  interventions: {
    total: 36,
    enAttente: 8,
    enAttenteValidation: 5,
    enCours: 14,
    resolues: 19
  },
  reclamations: {
    total: 19,
    enAttenteTraitement: 4
  },
  trajets: {
    total: 8,
    enCours: 2
  },
  parType: [
    { type: 'PC Fixe', total: 180, enService: 154, enPanne: 18, enAttente: 8, icon: '🖥️' },
    { type: 'Écran', total: 195, enService: 182, enPanne: 10, enAttente: 3, icon: '🔲' },
    { type: 'Laptop', total: 45, enService: 41, enPanne: 3, enAttente: 1, icon: '💻' },
    { type: 'Imprimante', total: 32, enService: 24, enPanne: 6, enAttente: 2, icon: '🖨️' },
    { type: 'Switch & Réseau', total: 24, enService: 22, enPanne: 2, enAttente: 0, icon: '🌐' },
    { type: 'Flybox', total: 14, enService: 13, enPanne: 1, enAttente: 0, icon: '📶' }
  ],
  etablissements: [
    { id: '1', nom: 'Lycée Ibn Abi Dhiaf', delegation: 'Manouba', total: 84, enService: 74, enPanne: 6, enAttente: 4, bacPratiquePret: true },
    { id: '2', nom: 'Collège Pilote Manouba', delegation: 'Manouba', total: 52, enService: 48, enPanne: 2, enAttente: 2, bacPratiquePret: true },
    { id: '3', nom: 'Lycée Asad Ibn Al Fourat', delegation: 'Oued Ellil', total: 68, enService: 56, enPanne: 8, enAttente: 4, bacPratiquePret: false },
    { id: '4', nom: 'Lycée Borj El Amri', delegation: 'Borj El Amri', total: 42, enService: 36, enPanne: 4, enAttente: 2, bacPratiquePret: false },
    { id: '5', nom: 'Lycée Mornaguia', delegation: 'Mornaguia', total: 60, enService: 52, enPanne: 6, enAttente: 2, bacPratiquePret: true },
    { id: '6', nom: 'Lycée Tebourba', delegation: 'Tebourba', total: 42, enService: 32, enPanne: 2, enAttente: 8, bacPratiquePret: true }
  ],
  pannesRecentes: [
    { id: 'EQ-0412', type: 'PC Fixe', marque: 'Dell OptiPlex 3080', etablissement: 'Lycée Asad Ibn Al Fourat', labo: 'Labo Info 1', panne: 'Alimentation défectueuse (ne démarre plus)', date: '2026-10-25', priorite: 'Élevée', statut: 'Attente technicien' },
    { id: 'EQ-0189', type: 'Imprimante', marque: 'HP LaserJet Pro M404n', etablissement: 'Lycée Ibn Abi Dhiaf', labo: 'Administration', panne: 'Bourrage mécanique récurrent & toner', date: '2026-10-25', priorite: 'Moyenne', statut: 'En cours d\'intervention' },
    { id: 'EQ-0322', type: 'Switch & Réseau', marque: 'Cisco Catalyst 2960', etablissement: 'Lycée Mornaguia', labo: 'Local Réseau Bât B', panne: 'Coupure ports 12-16 (salle profs)', date: '2026-10-26', priorite: 'Critique', statut: 'Ticket prioritaire' },
    { id: 'EQ-0504', type: 'Laptop', marque: 'Lenovo ThinkPad E15', etablissement: 'Collège Pilote Manouba', labo: 'Labo Techno', panne: 'Nappe vidéo écran défectueuse', date: '2026-10-26', priorite: 'Moyenne', statut: 'Demande pièce' }
  ],
  actionsATraiter: [
    { titre: 'Arrivages en attente de triple confirmation', count: 3, type: 'arrivage', urgence: 'Haute' },
    { titre: 'Équipements en panne signalés à inspecter', count: 28, type: 'panne', urgence: 'Critique' },
    { titre: 'Dossiers de dommage total en attente de validation', count: 4, type: 'dommage', urgence: 'Moyenne' },
    { titre: 'Formulaires préparatoires Bac Pratique reçus', count: 6, type: 'bac', urgence: 'Normale' }
  ]
};

let MOCK_INTERVENTIONS = [
  { id: '1', reference: 'INT-2026-001', statut: 'EN_COURS', description: 'Remplacement écran salle informatique', etablissement: 'Lycée Ibn Abi Dhiaf', date: '2026-10-24' },
  { id: '2', reference: 'INT-2026-002', statut: 'CLOTUREE', description: 'Maintenance routeur labo 2', etablissement: 'Collège Pilote Manouba', date: '2026-10-22' },
  { id: '3', reference: 'INT-2026-003', statut: 'EN_ATTENTE_VALIDATION', description: 'Réparation imprimante administration', etablissement: 'Lycée Asad Ibn Al Fourat', date: '2026-10-25' },
  { id: '4', reference: 'INT-2026-004', statut: 'EN_COURS', description: 'Installation switch réseau 24 ports', etablissement: 'Lycée Mornaguia', date: '2026-10-26' }
];

// Données Directeur d'établissement (Lycée Ibn Abi Dhiaf - Manouba)
let DIRECTEUR_DATA: any = {
  etablissement: {
    nom: 'Lycée Ibn Abi Dhiaf',
    code: '110201',
    delegation: 'Manouba',
    directeur: 'M. Moncef Ben Salem',
    email: 'directeur.ibnabidhiaf@edunet.tn',
    circuits: [
      { id: 'C1', type: 'Principal (Fibre Optique Edunet)', operateur: 'Tunisie Telecom', debit: '50 Mbps', statut: 'ACTIF', expiration: '2027-06-30' },
      { id: 'C2', type: 'Secours (Flybox 4G Pro)', operateur: 'Ooredoo', debit: '25 Mbps', statut: 'ACTIF', expiration: '2027-01-15' }
    ]
  },
  stats: {
    totalEquipements: 84,
    enService: 74,
    enPanne: 6,
    enPretSortant: 4,
    empruntes: 0
  },
  interventionsAValider: [
    {
      id: 'INT-2026-003',
      technicien: 'Sami Khelifi (Technicien Interne CRE)',
      type: 'Changement bloc alimentation & test réseau',
      equipementId: 'EQ-0189',
      equipementNom: 'PC Fixe HP ProDesk 400 - Labo Info 1',
      dateIntervention: '2026-10-26',
      rapportDetaille: 'Remplacement bloc alimentation ATX 300W HS suite surtension + test de continuité sur le port Ethernet. Rétablissement ok.',
      piecesPosees: 'Bloc alim ATX HP SN: PWR-2026-98741',
      statut: 'EN_ATTENTE_VALIDATION_DIRECTEUR'
    },
    {
      id: 'INT-2026-005',
      technicien: 'Société MICRO-TECH (Prestataire Marché AO-2025-04)',
      type: 'Maintenance Imprimante Réseau',
      equipementId: 'EQ-0211',
      equipementNom: 'HP LaserJet Pro M404n - Secrétariat',
      dateIntervention: '2026-10-25',
      rapportDetaille: 'Remplacement galet d\'entraînement du papier (roller kit) + dépoussiérage bloc laser. 50 pages test tirées sans bourrage.',
      piecesPosees: 'Kit Roller HP Pick-up SN: ROL-778841',
      statut: 'EN_ATTENTE_VALIDATION_DIRECTEUR'
    }
  ],
  demandesPrets: [
    {
      id: 'PRET-2026-012',
      direction: 'RECU',
      demandeurNom: 'Lycée Asad Ibn Al Fourat (Oued Ellil)',
      typeMateriel: '10 PC Fixes + 1 Flybox 4G de secours',
      motif: 'Préparation des épreuves du Bac Pratique 2026 (Salle C2 en travaux)',
      periode: '15 Mai 2026 au 30 Mai 2026',
      statut: 'EN_ATTENTE_REPONSE_DIRECTEUR'
    },
    {
      id: 'PRET-2026-008',
      direction: 'ENVOYE',
      cibleNom: 'Collège Pilote Manouba',
      typeMateriel: '1 Switch 24 ports Gigabit Cisco',
      motif: 'Besoin renfort réseau local temporaire',
      periode: '01 Nov 2026 au 15 Nov 2026',
      statut: 'VALIDE_SUPERVISEUR_TRANSFERT'
    }
  ],
  reclamations: [
    {
      id: 'REC-2026-0041',
      type: 'PANNE_EQUIPEMENT',
      titre: '5 Écrans Dell sans affichage suite coupure électrique',
      labo: 'Labo Informatique 2',
      equipement: 'Écrans Dell 24" P2419H (S/N: DL-8841-8845)',
      criticite: 'CRITIQUE',
      bacPratique: true,
      dateDeclaration: '2026-10-26T09:15:00',
      statut: 'MISSION_ASSIGNEE',
      statutTexte: 'Prise en charge SD TIC : Ordre de Mission OM-2026-0188 émis',
      sdTicDetails: {
        omNumero: 'OM-2026-0188',
        vehicule: 'Peugeot Partner (204 TU 1150)',
        chauffeur: 'Amor Trabelsi',
        technicien: 'Sami Khelifi (Technicien interne)',
        dateMission: '2026-10-27 (Demain 08:30)'
      },
      rapportTechnicien: null
    },
    {
      id: 'REC-2026-0038',
      type: 'CONNECTIVITE',
      titre: 'Coupure totale ligne Edunet principale Fibre',
      labo: 'Tous les laboratoires & Administration',
      equipement: 'Circuit Internet Edunet (Fibre TT - Réf: TT-MAN-8841)',
      criticite: 'CRITIQUE',
      bacPratique: true,
      dateDeclaration: '2026-10-24T14:30:00',
      statut: 'EN_COURS_INTERVENTION',
      statutTexte: 'Bascule Flybox provisoire activée · Équipe réseau SD TIC sur place',
      sdTicDetails: {
        omNumero: 'OM-2026-0174',
        vehicule: 'Renault Kangoo (185 TU 4421)',
        chauffeur: 'Hédi Baccouche',
        technicien: 'Karim Bouazizi (Ingénieur Réseau SD TIC)',
        dateMission: '2026-10-25'
      },
      rapportTechnicien: 'Test OTDR effectué sur jarretière optique : signal atténué à 800m. Signalement transmis à Tunisie Telecom pour réparation manchon externe. Basculement Flybox secours opérationnel pour le Bac.'
    },
    {
      id: 'REC-2026-0029',
      type: 'PANNE_EQUIPEMENT',
      titre: 'Panne Imprimante HP Bac Pratique',
      labo: 'Salle Tirage Épreuves',
      equipement: 'HP LaserJet Enterprise M506',
      criticite: 'HAUTE',
      bacPratique: true,
      dateDeclaration: '2026-10-21T11:00:00',
      statut: 'RESOLUE_A_VALIDER',
      statutTexte: 'Intervention terminée par technicien · En attente validation directeur',
      sdTicDetails: {
        omNumero: 'OM-2026-0155',
        vehicule: 'Peugeot Partner',
        chauffeur: 'Amor Trabelsi',
        technicien: 'Sami Khelifi',
        dateMission: '2026-10-22'
      },
      rapportTechnicien: 'Four de fixation (fuser unit) remplacé par pièce d\'origine certifiée. Tirage de contrôle conforme.'
    }
  ]
};

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;

  // Tableau de bord CRE Régional
  if (url.includes('/dashboard/stats')) {
    return of(new HttpResponse({ status: 200, body: MOCK_STATS }));
  }

  // Tableau de bord Directeur
  if (url.includes('/directeur/data')) {
    return of(new HttpResponse({ status: 200, body: DIRECTEUR_DATA }));
  }

  // Déclaration de réclamation par le Directeur (Panne équipement ou Connectivité)
  if (url.includes('/reclamations/create')) {
    const body = (req.body as any) || {};
    const nouvelleReclamation = {
      id: `REC-2026-${String(DIRECTEUR_DATA.reclamations.length + 42).padStart(4, '0')}`,
      type: body.type || 'PANNE_EQUIPEMENT',
      titre: body.titre || 'Signalement incident',
      labo: body.labo || 'Laboratoire Informatique',
      equipement: body.equipement || 'Matériel non spécifié',
      criticite: body.criticite || 'HAUTE',
      bacPratique: !!body.bacPratique,
      dateDeclaration: new Date().toISOString(),
      statut: 'TRANSMISE_SD_TIC',
      statutTexte: 'Transmise à la Sous-Direction TIC · En attente d\'affectation d\'Ordre de Mission (OM)',
      sdTicDetails: null,
      rapportTechnicien: null
    };
    DIRECTEUR_DATA.reclamations = [nouvelleReclamation, ...DIRECTEUR_DATA.reclamations];
    return of(new HttpResponse({ status: 201, body: nouvelleReclamation }));
  }

  // Validation d'une intervention par le Directeur
  if (url.includes('/interventions/valider')) {
    const body = (req.body as any) || {};
    const id = body.interventionId;
    DIRECTEUR_DATA.interventionsAValider = DIRECTEUR_DATA.interventionsAValider.filter((i: any) => i.id !== id);
    return of(new HttpResponse({ status: 200, body: { success: true, message: 'Intervention validée avec succès par le Directeur.' } }));
  }

  // Réponse à une demande de prêt par le Directeur
  if (url.includes('/prets/repondre')) {
    const body = (req.body as any) || {};
    const { pretId, accept } = body;
    const pret = DIRECTEUR_DATA.demandesPrets.find((p: any) => p.id === pretId);
    if (pret) {
      pret.statut = accept ? 'ACCEPTE_PAR_DIRECTEUR' : 'REFUSE_PAR_DIRECTEUR';
    }
    return of(new HttpResponse({ status: 200, body: { success: true, statut: pret?.statut } }));
  }

  // Nouvelle demande d'emprunt ou Flybox
  if (url.includes('/prets/demander')) {
    const body = (req.body as any) || {};
    const nouveauPret = {
      id: `PRET-2026-${String(DIRECTEUR_DATA.demandesPrets.length + 15).padStart(3, '0')}`,
      direction: 'ENVOYE',
      cibleNom: body.cibleNom || 'CRE Manouba / Établissement partenaire',
      typeMateriel: body.typeMateriel || 'Équipements informatiques',
      motif: body.motif || 'Besoin épreuves pratiques Bac',
      periode: body.periode || 'Mai 2026',
      statut: 'EN_ATTENTE_SUPERVISEUR_TIC'
    };
    DIRECTEUR_DATA.demandesPrets = [nouveauPret, ...DIRECTEUR_DATA.demandesPrets];
    return of(new HttpResponse({ status: 201, body: nouveauPret }));
  }

  // Interventions génériques
  if (url.includes('/interventions')) {
    if (req.method === 'POST') {
      const newIntervention = {
        id: String(Date.now()),
        reference: `INT-2026-${String(MOCK_INTERVENTIONS.length + 1).padStart(3, '0')}`,
        statut: 'EN_ATTENTE_VALIDATION',
        ...((req.body as any) || {})
      };
      MOCK_INTERVENTIONS = [newIntervention, ...MOCK_INTERVENTIONS];
      return of(new HttpResponse({ status: 201, body: newIntervention }));
    }
    return of(new HttpResponse({ status: 200, body: MOCK_INTERVENTIONS }));
  }

  if (url.includes('/auth/login')) {
    return of(new HttpResponse({
      status: 200,
      body: {
        accessToken: 'mock-jwt-token-education-tunisie',
        user: {
          id: '1',
          matricule: 'ME-8472',
          email: 'directeur.ibnabidhiaf@edunet.tn',
          nom: 'Ben Salem',
          prenom: 'Moncef',
          role: 'DIRECTEUR'
        }
      }
    }));
  }

  return next(req);
};
