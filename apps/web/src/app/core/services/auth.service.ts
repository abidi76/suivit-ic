import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';

export type UserRole = 
  | 'ADMIN_CENTRAL' 
  | 'ADMIN_ADJOINT' 
  | 'SD_TIC' 
  | 'DIRECTEUR' 
  | 'PROF_LABO' 
  | 'TECHNICIEN'
  | 'AGENT_ADMIN'
  | 'TECHNICIEN_PRESTATAIRE'
  | 'SD_BATIMENTS';

export interface DotationEquipement {
  id: string;
  type: string;
  marqueModele: string;
  numeroSerie: string;
  dateDotation: string;
  etat: 'FONCTIONNEL' | 'EN_PANNE' | 'A_REMPLACER';
}

export interface UserAccount {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  perimetre: string;
  creId?: string;
  creNom?: string;
  etablissementId?: string;
  etablissementNom?: string;
  laboId?: string;
  laboNom?: string;
  avatar: string;
  permissionsAdjoint?: {
    arrivages: boolean;
    inventaires: boolean;
    pannesPertes: boolean;
    comptesLocaux: boolean;
    rapports: boolean;
  };
  agentProfile?: {
    direction: string;
    service: string;
    bureau: string;
    localisationType: 'CENTRAL_CRE' | 'CREFOC' | 'ETABLISSEMENT';
    localisationNom: string;
    ipFixe: string;
    vlan: string;
    priseMurale: string;
    switchPort: string;
    connexionStatut: 'CONNECTE' | 'DEGRADE' | 'COUPE';
    equipementsDotation: DotationEquipement[];
    tachesDeleguees?: string[];
  };
  prestataireProfile?: {
    societeNom: string;
    numeroMarche: string;
    specialite: string;
    telephone: string;
  };
  batimentsProfile?: {
    service: string;
    bureau: string;
    parcAutomobileResponsable: boolean;
    vehiculesSupervises: number;
    chauffeursActifs: number;
  };
}

export const PRESET_ACCOUNTS: UserAccount[] = [
  {
    id: 'USR-001',
    matricule: 'AC-1001',
    nom: 'Trabelsi',
    prenom: 'Khaled',
    email: 'admin.central1@edunet.tn',
    role: 'ADMIN_CENTRAL',
    roleLabel: 'Admin Central (Ministère)',
    perimetre: 'Administration Centrale · Ministère de l\'Éducation',
    avatar: '👑'
  },
  {
    id: 'USR-002',
    matricule: 'ADJ-1002',
    nom: 'Ben Romdhane',
    prenom: 'Fatma',
    email: 'adjoint1@edunet.tn',
    role: 'ADMIN_ADJOINT',
    roleLabel: 'Admin Central Adjoint',
    perimetre: 'Administration Centrale · Ministère',
    avatar: '🛡️',
    permissionsAdjoint: {
      arrivages: false,
      inventaires: true,
      pannesPertes: true,
      comptesLocaux: false,
      rapports: true
    }
  },
  {
    id: 'USR-003',
    matricule: 'SD-2001',
    nom: 'Gharbi',
    prenom: 'Mohamed',
    email: 'sdtic.manouba@edunet.tn',
    role: 'SD_TIC',
    roleLabel: 'Sous-Directeur TIC / Directeur TIC',
    perimetre: 'CRE Manouba (Tous les établissements & Local Central)',
    creId: 'CRE-01',
    creNom: 'CRE Manouba',
    avatar: '🏢'
  },
  {
    id: 'USR-004',
    matricule: 'DIR-3001',
    nom: 'Ben Salem',
    prenom: 'Moncef',
    email: 'directeur.ibnabidhiaf@edunet.tn',
    role: 'DIRECTEUR',
    roleLabel: 'Directeur d\'Établissement',
    perimetre: 'Lycée Ibn Abi Dhiaf · Manouba',
    creId: 'CRE-01',
    creNom: 'CRE Manouba',
    etablissementId: 'ETAB-101',
    etablissementNom: 'Lycée Ibn Abi Dhiaf - Manouba',
    avatar: '🏫'
  },
  {
    id: 'USR-005',
    matricule: 'PRF-4001',
    nom: 'Mansour',
    prenom: 'Sami',
    email: 'prof.sami@edunet.tn',
    role: 'PROF_LABO',
    roleLabel: 'Prof Responsable de Labo',
    perimetre: 'Labo Info 1 · Lycée Ibn Abi Dhiaf',
    creId: 'CRE-01',
    creNom: 'CRE Manouba',
    etablissementId: 'ETAB-101',
    etablissementNom: 'Lycée Ibn Abi Dhiaf - Manouba',
    laboId: 'LAB-01',
    laboNom: 'Labo Informatique 1',
    avatar: '👨‍🏫'
  },
  {
    id: 'USR-006',
    matricule: 'TEC-5001',
    nom: 'Khelifi',
    prenom: 'Sami',
    email: 'tech.khelifi@edunet.tn',
    role: 'TECHNICIEN',
    roleLabel: 'Technicien Interne CRE',
    perimetre: 'CRE Manouba · Équipe Mobile de Maintenance',
    creId: 'CRE-01',
    creNom: 'CRE Manouba',
    avatar: '🔧'
  },
  {
    id: 'USR-007',
    matricule: 'ADM-7101',
    nom: 'Ben Abdallah',
    prenom: 'Najla',
    email: 'najla.benabdallah@edunet.tn',
    role: 'AGENT_ADMIN',
    roleLabel: 'Agent Administratif (Siège CRE / CREFOC)',
    perimetre: 'Siège Central CRE Manouba · Service Pédagogique & CREFOC',
    creId: 'CRE-01',
    creNom: 'CRE Manouba',
    avatar: '👩‍💼',
    agentProfile: {
      direction: 'Direction des Affaires Pédagogiques, Examens & Formation',
      service: 'Service de Coordination Pédagogique & Support CREFOC',
      bureau: 'Bureau 14 (Rez-de-chaussée Aile B)',
      localisationType: 'CENTRAL_CRE',
      localisationNom: 'Siège Central CRE Manouba (Rattachée CREFOC)',
      ipFixe: '192.168.10.45',
      vlan: 'VLAN 10 - Administration CRE',
      priseMurale: 'PRISE-RJ45-B14-02',
      switchPort: 'SW-CORE-B1 / Port 18',
      connexionStatut: 'CONNECTE',
      tachesDeleguees: [
        'Mise à jour des fiches d\'inventaire des postes administratifs',
        'Réception des consommables et toners pour imprimantes du siège',
        'Pointage de présence des techniciens prestataires externes'
      ],
      equipementsDotation: [
        {
          id: 'EQ-ADM-01',
          type: 'PC de Bureau (Unité Centrale)',
          marqueModele: 'HP ProDesk 400 G7 SFF',
          numeroSerie: 'SN-HP-PD400-994102',
          dateDotation: '10/01/2024',
          etat: 'FONCTIONNEL'
        },
        {
          id: 'EQ-ADM-02',
          type: 'Écran 24 pouces',
          marqueModele: 'HP EliteDisplay E243',
          numeroSerie: 'SN-HP-SCR24-338190',
          dateDotation: '10/01/2024',
          etat: 'FONCTIONNEL'
        },
        {
          id: 'EQ-ADM-03',
          type: 'Imprimante Réseau Multifonction',
          marqueModele: 'HP LaserJet Pro MFP M428fdw',
          numeroSerie: 'SN-HP-MFP428-771204',
          dateDotation: '15/03/2024',
          etat: 'FONCTIONNEL'
        },
        {
          id: 'EQ-ADM-04',
          type: 'Onduleur Parafoudre 800VA',
          marqueModele: 'APC Back-UPS 800VA',
          numeroSerie: 'SN-APC-800-449188',
          dateDotation: '10/01/2024',
          etat: 'FONCTIONNEL'
        }
      ]
    }
  },
  {
    id: 'USR-008',
    matricule: 'PREST-8802',
    nom: 'Jaziri',
    prenom: 'Karim',
    email: 'k.jaziri@microtech.tn',
    role: 'TECHNICIEN_PRESTATAIRE',
    roleLabel: 'Technicien Prestataire Externe',
    perimetre: 'Société MICRO-TECH (Titulaire Marché National AO-2025-04)',
    creId: 'CRE-01',
    creNom: 'CRE Manouba',
    avatar: '🧰',
    prestataireProfile: {
      societeNom: 'Société MICRO-TECH Informatique SARL',
      numeroMarche: 'Marché National N° AO-2025-04 / Min. Éducation',
      specialite: 'Maintenance curative & préventive des parcs informatiques scolaires',
      telephone: '+216 71 889 450'
    }
  },
  {
    id: 'USR-009',
    matricule: 'SDB-3101',
    nom: 'Baccouche',
    prenom: 'Hédi',
    email: 'sd.batiments.manouba@edunet.tn',
    role: 'SD_BATIMENTS',
    roleLabel: 'Sous-Directeur Bâtiments & Parc Auto',
    perimetre: 'CRE Manouba · Bâtiments, Équipements & Flotte Automobile',
    creId: 'CRE-01',
    creNom: 'CRE Manouba',
    avatar: '🚐',
    batimentsProfile: {
      service: 'Sous-Direction des Bâtiments, Équipements & Matériel Roulant',
      bureau: 'Bureau 03 (Bâtiment Parc Auto & Logistique)',
      parcAutomobileResponsable: true,
      vehiculesSupervises: 6,
      chauffeursActifs: 5
    }
  }
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject: BehaviorSubject<UserAccount | null>;
  public currentUser$: Observable<UserAccount | null>;

  constructor(private router: Router) {
    const saved = localStorage.getItem('suivitic_user');
    let initialUser: UserAccount | null = null;
    if (saved) {
      try {
        initialUser = JSON.parse(saved);
      } catch (e) {
        initialUser = null;
      }
    }
    // Par défaut, si aucun utilisateur, connecter en DIRECTEUR ou laisser sur login
    if (!initialUser) {
      initialUser = PRESET_ACCOUNTS[3]; // Directeur par défaut
      localStorage.setItem('suivitic_user', JSON.stringify(initialUser));
      localStorage.setItem('token', 'token-' + initialUser.id);
    }
    this.currentUserSubject = new BehaviorSubject<UserAccount | null>(initialUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): UserAccount | null {
    return this.currentUserSubject.value;
  }

  login(credentials: { identifiant: string; motDePasse?: string }): Observable<boolean> {
    const found = PRESET_ACCOUNTS.find(
      u => u.email.toLowerCase() === credentials.identifiant.toLowerCase() ||
           u.matricule.toLowerCase() === credentials.identifiant.toLowerCase()
    );

    if (found) {
      this.setUser(found);
      this.redirectUserByRole(found.role);
      return of(true);
    }
    return of(false);
  }

  loginAsPreset(account: UserAccount): void {
    this.setUser(account);
    this.redirectUserByRole(account.role);
  }

  logout(): void {
    localStorage.removeItem('suivitic_user');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private setUser(user: UserAccount): void {
    localStorage.setItem('suivitic_user', JSON.stringify(user));
    localStorage.setItem('token', 'token-' + user.id);
    this.currentUserSubject.next(user);
  }

  public redirectUserByRole(role: UserRole): void {
    switch (role) {
      case 'ADMIN_CENTRAL':
      case 'ADMIN_ADJOINT':
        this.router.navigate(['/admin-central']);
        break;
      case 'SD_TIC':
        this.router.navigate(['/sd-tic']);
        break;
      case 'DIRECTEUR':
        this.router.navigate(['/directeur']);
        break;
      case 'PROF_LABO':
        this.router.navigate(['/prof']);
        break;
      case 'TECHNICIEN':
        this.router.navigate(['/technicien']);
        break;
      case 'AGENT_ADMIN':
        this.router.navigate(['/agent-admin']);
        break;
      case 'TECHNICIEN_PRESTATAIRE':
        this.router.navigate(['/technicien-prestataire']);
        break;
      case 'SD_BATIMENTS':
        this.router.navigate(['/sd-batiments']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  hasRole(allowedRoles: UserRole[]): boolean {
    const user = this.currentUserValue;
    if (!user) return false;
    return allowedRoles.includes(user.role);
  }

  getDashboardUrlForCurrent(): string {
    const user = this.currentUserValue;
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN_CENTRAL':
      case 'ADMIN_ADJOINT': return '/admin-central';
      case 'SD_TIC': return '/sd-tic';
      case 'DIRECTEUR': return '/directeur';
      case 'PROF_LABO': return '/prof';
      case 'TECHNICIEN': return '/technicien';
      case 'AGENT_ADMIN': return '/agent-admin';
      case 'TECHNICIEN_PRESTATAIRE': return '/technicien-prestataire';
      case 'SD_BATIMENTS': return '/sd-batiments';
      default: return '/login';
    }
  }
}