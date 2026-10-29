import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserAccount } from '../../core/services/auth.service';

export interface SurveillantJour {
  id: string;
  matricule: string;
  nomPrenom: string;
  etablissementOrigine: string;
  telephone: string;
  statutPresence: 'PRESENT' | 'ABSENT' | 'EN_RETARD' | 'REMPLACE';
  heureArrivee?: string;
  remplaceParMatricule?: string;
}

export interface LaboCentreJour {
  id: string;
  nomLabo: string;
  etage: string;
  capaciteCandidats: number;
  postesSecours: number;
  profResponsablePreparation: string;
  etatSysteme: 'OPERATIONNEL' | 'INCIDENT_MINEUR' | 'BLOQUE';
  // Surveillants titulaires affectés pour ce labo le jour J (2 par labo)
  surveillantsTitulaires: SurveillantJour[];
  candidatsPresents: number;
  candidatsAbsents: number;
  sujetsDistribues: boolean;
  clavierCleUsbRemise: boolean;
  pvSeanceValide: boolean;
}

export interface IncidentJour {
  id: string;
  heure: string;
  laboNom: string;
  nature: string;
  decisionPrise: string;
  enregistrePar: string;
}

@Component({
  selector: 'app-coordinateur-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coordinateur-dashboard.component.html',
  styleUrls: ['./coordinateur-dashboard.component.scss']
})
export class CoordinateurDashboardComponent implements OnInit {
  currentUser: UserAccount | null = null;
  toastMessage = '';

  // Informations Institutionnelles du Centre d'Examen
  centreExamenNom = 'Lycée Ibn Abi Dhiaf - Manouba';
  centreExamenCode = 'CTR-BAC-MAN-01';
  creRattachement = 'CRE Manouba';

  // Équipe de Direction du Centre d'Examen
  chefCentreNom = 'M. Moncef Ben Salem'; // Directeur du Lycée & Chef du Centre d'Examen
  chefCentreRole = 'Directeur du Lycée · Chef du Centre d\'Examen du Baccalauréat';
  
  censeurAdjointNom = 'M. Hichem Zouaoui'; // Le Censeur (الناظر) · Adjoint au Chef de Centre
  censeurAdjointRole = 'Censeur du Lycée (الناظر) · Adjoint au Chef du Centre d\'Examen';

  // RÈGLE FORMELLE : Le tableau de bord du coordinateur est centré sur CE JOUR-LÀ SEULEMENT
  dateAujourdhui = '2026-05-18';
  journeeLibelle = 'Lundi 18 Mai 2026 (Jour 1 du Baccalauréat Pratique)';
  seanceEnCours = 'Séance 1 : 08h00 - 10h00';
  sessionNom = 'Session Principale 2026';

  // Sélecteur de journées pour consultation ou archivage
  joursSessionBac = [
    { date: '2026-05-18', libelle: 'Lundi 18 Mai 2026 (Jour 1 - Épreuve Pratique)' },
    { date: '2026-05-19', libelle: 'Mardi 19 Mai 2026 (Jour 2 - Épreuve Pratique)' },
    { date: '2026-05-20', libelle: 'Mercredi 20 Mai 2026 (Jour 3 - Épreuve Pratique)' },
    { date: '2026-05-21', libelle: 'Jeudi 21 Mai 2026 (Jour 4 - Épreuve Pratique)' },
    { date: '2026-05-22', libelle: 'Vendredi 22 Mai 2026 (Jour 5 - Épreuve Pratique)' }
  ];

  // 1. Laboratoires du Centre d'Examen supervisés ce jour-là (le centre contient au moins 1 labo, ici 3)
  labosDuCentre: LaboCentreJour[] = [
    {
      id: 'LAB-CTR-01',
      nomLabo: 'Laboratoire Informatique 1 (Labo Principal)',
      etage: 'Rez-de-chaussée · Aile Sciences',
      capaciteCandidats: 16,
      postesSecours: 2,
      profResponsablePreparation: 'M. Sami Mansour',
      etatSysteme: 'OPERATIONNEL',
      candidatsPresents: 16,
      candidatsAbsents: 0,
      sujetsDistribues: true,
      clavierCleUsbRemise: true,
      pvSeanceValide: false,
      surveillantsTitulaires: [
        {
          id: 'SURV-01',
          matricule: 'PRF-4015',
          nomPrenom: 'Mounir Chaabane',
          etablissementOrigine: 'Lycée Ibn Abi Dhiaf',
          telephone: '+216 97 325 119',
          statutPresence: 'PRESENT',
          heureArrivee: '07h25'
        },
        {
          id: 'SURV-02',
          matricule: 'PRF-4062',
          nomPrenom: 'Nadia Hammami',
          etablissementOrigine: 'Lycée Denden',
          telephone: '+216 93 456 781',
          statutPresence: 'PRESENT',
          heureArrivee: '07h30'
        }
      ]
    },
    {
      id: 'LAB-CTR-02',
      nomLabo: 'Laboratoire Informatique 2',
      etage: '1er Étage · Aile B',
      capaciteCandidats: 16,
      postesSecours: 2,
      profResponsablePreparation: 'M. Mounir Chaabane',
      etatSysteme: 'OPERATIONNEL',
      candidatsPresents: 15,
      candidatsAbsents: 1,
      sujetsDistribues: true,
      clavierCleUsbRemise: true,
      pvSeanceValide: false,
      surveillantsTitulaires: [
        {
          id: 'SURV-03',
          matricule: 'PRF-4041',
          nomPrenom: 'Houda Dridi',
          etablissementOrigine: 'Lycée Mornaguia',
          telephone: '+216 95 620 334',
          statutPresence: 'PRESENT',
          heureArrivee: '07h28'
        },
        {
          id: 'SURV-04',
          matricule: 'PRF-4077',
          nomPrenom: 'Walid Trabelsi',
          etablissementOrigine: 'Lycée Borj El Amri',
          telephone: '+216 98 112 405',
          statutPresence: 'PRESENT',
          heureArrivee: '07h35'
        }
      ]
    },
    {
      id: 'LAB-CTR-03',
      nomLabo: 'Laboratoire Informatique 3 (Multimédia & Réserve)',
      etage: '1er Étage · Aile C',
      capaciteCandidats: 14,
      postesSecours: 2,
      profResponsablePreparation: 'Mme Leila Gharbi',
      etatSysteme: 'OPERATIONNEL',
      candidatsPresents: 14,
      candidatsAbsents: 0,
      sujetsDistribues: true,
      clavierCleUsbRemise: true,
      pvSeanceValide: false,
      surveillantsTitulaires: [
        {
          id: 'SURV-05',
          matricule: 'PRF-4088',
          nomPrenom: 'Kamel Riahi',
          etablissementOrigine: 'Lycée Asad Ibn El Fourat',
          telephone: '+216 96 440 918',
          statutPresence: 'PRESENT',
          heureArrivee: '07h22'
        },
        {
          id: 'SURV-06',
          matricule: 'PRF-4092',
          nomPrenom: 'Sonia Bouzid',
          etablissementOrigine: 'Lycée Oued Ellil',
          telephone: '+216 92 881 337',
          statutPresence: 'PRESENT',
          heureArrivee: '07h32'
        }
      ]
    }
  ];

  // 2. Professeurs Surveillants de Réserve (Volants) présents au Centre ce jour-là
  surveillantsReservesJour: {
    id: string;
    matricule: string;
    nomPrenom: string;
    etablissementOrigine: string;
    telephone: string;
    heurePointage: string;
    statutReserve: 'DISPONIBLE_AU_CENTRE' | 'ENGAGE_EN_REMPLACEMENT';
    laboAffecteEnRemplacement?: string;
  }[] = [
    {
      id: 'RES-01',
      matricule: 'PRF-4055',
      nomPrenom: 'Zouhair Mejri',
      etablissementOrigine: 'Lycée Oued Ellil',
      telephone: '+216 94 771 209',
      heurePointage: '07h15',
      statutReserve: 'DISPONIBLE_AU_CENTRE'
    },
    {
      id: 'RES-02',
      matricule: 'PRF-4070',
      nomPrenom: 'Karim Bouazizi',
      etablissementOrigine: 'Collège Pilote Manouba',
      telephone: '+216 92 110 994',
      heurePointage: '07h20',
      statutReserve: 'DISPONIBLE_AU_CENTRE'
    }
  ];

  // 3. Incidents et Événements signalés le jour J
  incidentsJour: IncidentJour[] = [
    {
      id: 'INC-01',
      heure: '07h45',
      laboNom: 'Labo 1',
      nature: 'Test électrique de l\'onduleur 3000VA réussi. Réseau local commuté sur switch Gigabit.',
      decisionPrise: 'Feu vert accordé pour l\'entrée des candidats.',
      enregistrePar: 'M. Sami Mansour (Coordinateur)'
    }
  ];

  // Modale Remplacement d'urgence
  showRemplacementModal = false;
  laboCibleRemplacement: LaboCentreJour | null = null;
  surveillantARemplacer: SurveillantJour | null = null;
  reserveSelectionneeMatricule = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadPersistedCoordData();
  }

  loadPersistedCoordData(): void {
    const saved = localStorage.getItem('suivitic_coordinateur_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.labosDuCentre) this.labosDuCentre = parsed.labosDuCentre;
        if (parsed.surveillantsReservesJour) this.surveillantsReservesJour = parsed.surveillantsReservesJour;
        if (parsed.incidentsJour) this.incidentsJour = parsed.incidentsJour;
      } catch (e) {}
    }
  }

  saveCoordData(): void {
    const data = {
      labosDuCentre: this.labosDuCentre,
      surveillantsReservesJour: this.surveillantsReservesJour,
      incidentsJour: this.incidentsJour
    };
    localStorage.setItem('suivitic_coordinateur_data', JSON.stringify(data));
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => this.toastMessage = '', 4500);
  }

  // Émargement présence surveillant titulaire
  basculerPresenceSurveillant(labo: LaboCentreJour, surv: SurveillantJour): void {
    if (surv.statutPresence === 'PRESENT') {
      surv.statutPresence = 'ABSENT';
      this.showToast(`⚠️ Surveillant ${surv.nomPrenom} marqué ABSENT sur ${labo.nomLabo}. Vous pouvez le remplacer par une réserve.`);
    } else {
      surv.statutPresence = 'PRESENT';
      if (!surv.heureArrivee) {
        const now = new Date();
        surv.heureArrivee = `${now.getHours()}h${now.getMinutes().toString().padStart(2, '0')}`;
      }
      this.showToast(`✓ Présence de ${surv.nomPrenom} pointée à ${surv.heureArrivee}.`);
    }
    this.saveCoordData();
  }

  // Ouvrir modale de remplacement
  ouvrirRemplacement(labo: LaboCentreJour, surv: SurveillantJour): void {
    this.laboCibleRemplacement = labo;
    this.surveillantARemplacer = surv;
    this.reserveSelectionneeMatricule = this.surveillantsReservesJour.find(r => r.statutReserve === 'DISPONIBLE_AU_CENTRE')?.matricule || '';
    this.showRemplacementModal = true;
  }

  // Valider le remplacement par un surveillant de réserve
  confirmerRemplacement(): void {
    if (!this.laboCibleRemplacement || !this.surveillantARemplacer || !this.reserveSelectionneeMatricule) return;

    const reserve = this.surveillantsReservesJour.find(r => r.matricule === this.reserveSelectionneeMatricule);
    if (!reserve) return;

    // Mise à jour de l'ancien surveillant
    this.surveillantARemplacer.statutPresence = 'REMPLACE';
    this.surveillantARemplacer.remplaceParMatricule = reserve.matricule;

    // Mise à jour du statut du surveillant de réserve
    reserve.statutReserve = 'ENGAGE_EN_REMPLACEMENT';
    reserve.laboAffecteEnRemplacement = this.laboCibleRemplacement.nomLabo;

    // Enregistrement d'un incident officiel de traçabilité
    const now = new Date();
    const heureStr = `${now.getHours()}h${now.getMinutes().toString().padStart(2, '0')}`;
    this.incidentsJour.unshift({
      id: 'INC-' + Date.now(),
      heure: heureStr,
      laboNom: this.laboCibleRemplacement.nomLabo,
      nature: `Remplacement de ${this.surveillantARemplacer.nomPrenom} (Absent/Indisponible)`,
      decisionPrise: `Remplacement officiel par ${reserve.nomPrenom} (Surveillant de Réserve - Matr. ${reserve.matricule}). Chef de centre et Censeur informés.`,
      enregistrePar: 'M. Sami Mansour (Prof Coordinateur)'
    });

    this.saveCoordData();
    this.showRemplacementModal = false;
    this.showToast(`✓ Remplacement acté : ${reserve.nomPrenom} affecté en urgence sur le ${this.laboCibleRemplacement.nomLabo}.`);
  }

  // Valider le PV de séance d'un labo
  validerPvLabo(labo: LaboCentreJour): void {
    labo.pvSeanceValide = true;
    this.saveCoordData();
    this.showToast(`✓ PV de séance du ${labo.nomLabo} visé et validé par le Coordinateur.`);
  }

  imprimerRapportJournee(): void {
    window.print();
  }
}
