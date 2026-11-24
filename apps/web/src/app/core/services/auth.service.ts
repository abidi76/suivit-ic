import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';

export type UserRole =
  | 'ADMIN_CENTRAL'
  | 'ADMIN_ADJOINT'
  | 'SD_TIC'
  | 'DIRECTEUR'
  | 'PROF_LABO'
  | 'TECHNICIEN'
  | 'AGENT_ADMIN'
  | 'TECHNICIEN_PRESTATAIRE'
  | 'SD_BATIMENTS'
  | 'INSPECTEUR'
  | 'COORDINATEUR';

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
    comptesElissaEdunet: boolean;
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

interface LoginResponse {
  accessToken?: string;
  access_token?: string;
  token?: string;
  user?: Partial<UserAccount>;
  utilisateur?: Partial<UserAccount>;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = '/api/auth';
  private readonly currentUserSubject = new BehaviorSubject<UserAccount | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) {
    localStorage.removeItem('suivitic_custom_passwords');
  }

  public get currentUserValue(): UserAccount | null {
    return this.currentUserSubject.value;
  }

  changerMotDePasse(emailOuMatricule: string, nouveauMdp: string): Observable<{ success: boolean; message: string }> {
    const ident = (emailOuMatricule || '').trim();
    const mdp = nouveauMdp || '';

    if (!ident) {
      return of({ success: false, message: 'Veuillez saisir votre adresse e-mail institutionnelle ou matricule.' });
    }
    if (mdp.length < 8) {
      return of({ success: false, message: 'Le mot de passe doit comporter au moins 8 caractères.' });
    }

    return this.http.post<{ success?: boolean; message?: string }>(`${this.apiUrl}/change-password`, {
      identifiant: ident,
      nouveauMotDePasse: mdp
    }).pipe(
      map((response) => ({
        success: response.success !== false,
        message: response.message || 'Votre mot de passe a été mis à jour.'
      })),
      catchError((error: HttpErrorResponse) => of({
        success: false,
        message: error.error?.message || 'Impossible de modifier le mot de passe pour le moment.'
      }))
    );
  }

  login(credentials: { identifiant: string; motDePasse?: string }): Observable<{ success: boolean; message?: string }> {
    const identifiant = (credentials.identifiant || '').trim();
    const motDePasse = credentials.motDePasse || '';

    if (!identifiant) {
      return of({ success: false, message: 'Veuillez saisir votre adresse e-mail institutionnelle ou matricule.' });
    }
    if (!motDePasse) {
      return of({ success: false, message: 'Veuillez saisir votre mot de passe.' });
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { identifiant, motDePasse }).pipe(
      tap((response) => {
        const token = response.accessToken || response.access_token || response.token;
        const apiUser = response.user || response.utilisateur;
        if (!token) throw new Error('Le serveur n’a pas fourni de jeton d’accès.');

        const user = this.normalizeUser(apiUser, identifiant);
        localStorage.setItem('token', token);
        localStorage.setItem('suivitic_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.redirectUserByRole(user.role);
      }),
      map(() => ({ success: true })),
      catchError((error: HttpErrorResponse | Error) => {
        const message = error instanceof HttpErrorResponse
          ? (error.error?.message || 'Identifiants incorrects ou service indisponible.')
          : error.message;
        return of({ success: false, message });
      })
    );
  }

  logout(): void {
    localStorage.removeItem('suivitic_user');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private normalizeUser(apiUser: Partial<UserAccount> | undefined, identifiant: string): UserAccount {
    const role = this.normalizeRole(apiUser?.role);
    return {
      id: apiUser?.id || apiUser?.matricule || identifiant,
      matricule: apiUser?.matricule || identifiant,
      nom: apiUser?.nom || '',
      prenom: apiUser?.prenom || '',
      email: apiUser?.email || identifiant,
      role,
      roleLabel: apiUser?.roleLabel || role,
      perimetre: apiUser?.perimetre || '',
      creId: apiUser?.creId,
      creNom: apiUser?.creNom,
      etablissementId: apiUser?.etablissementId,
      etablissementNom: apiUser?.etablissementNom,
      laboId: apiUser?.laboId,
      laboNom: apiUser?.laboNom,
      avatar: apiUser?.avatar || '👤',
      permissionsAdjoint: apiUser?.permissionsAdjoint,
      agentProfile: apiUser?.agentProfile,
      prestataireProfile: apiUser?.prestataireProfile,
      batimentsProfile: apiUser?.batimentsProfile
    };
  }

  private normalizeRole(role: UserRole | undefined): UserRole {
    const mapping: Record<string, UserRole> = {
      ADMIN_CENTRAL: 'ADMIN_CENTRAL', ADMIN_ADJOINT: 'ADMIN_ADJOINT',
      SOUS_DIRECTEUR_TIC: 'SD_TIC', SD_TIC: 'SD_TIC',
      DIRECTEUR_ETABLISSEMENT: 'DIRECTEUR', DIRECTEUR: 'DIRECTEUR',
      PROF_RESPONSABLE: 'PROF_LABO', PROF_LABO: 'PROF_LABO',
      TECHNICIEN_INTERNE: 'TECHNICIEN', TECHNICIEN: 'TECHNICIEN',
      TECHNICIEN_PRESTATAIRE: 'TECHNICIEN_PRESTATAIRE',
      SOUS_DIRECTEUR_BATIMENTS: 'SD_BATIMENTS', SD_BATIMENTS: 'SD_BATIMENTS',
      AGENT_ADMIN: 'AGENT_ADMIN', INSPECTEUR: 'INSPECTEUR', COORDINATEUR: 'COORDINATEUR'
    };
    return role ? (mapping[role] || 'AGENT_ADMIN') : 'AGENT_ADMIN';
  }

  public redirectUserByRole(role: UserRole): void {
    switch (role) {
      case 'ADMIN_CENTRAL':
      case 'ADMIN_ADJOINT': this.router.navigate(['/admin-central']); break;
      case 'SD_TIC': this.router.navigate(['/sd-tic']); break;
      case 'DIRECTEUR': this.router.navigate(['/directeur']); break;
      case 'PROF_LABO': this.router.navigate(['/prof']); break;
      case 'TECHNICIEN': this.router.navigate(['/technicien']); break;
      case 'AGENT_ADMIN': this.router.navigate(['/agent-admin']); break;
      case 'TECHNICIEN_PRESTATAIRE': this.router.navigate(['/technicien-prestataire']); break;
      case 'SD_BATIMENTS': this.router.navigate(['/sd-batiments']); break;
      case 'INSPECTEUR': this.router.navigate(['/inspecteur']); break;
      case 'COORDINATEUR': this.router.navigate(['/coordinateur']); break;
      default: this.router.navigate(['/login']);
    }
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value && !!localStorage.getItem('token');
  }

  hasRole(allowedRoles: UserRole[]): boolean {
    const user = this.currentUserValue;
    return !!user && allowedRoles.includes(user.role);
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
      case 'INSPECTEUR': return '/inspecteur';
      case 'COORDINATEUR': return '/coordinateur';
      default: return '/login';
    }
  }
}
