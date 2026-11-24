import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';

export type UserRole =
  | 'ADMIN_CENTRAL' | 'ADMIN_ADJOINT' | 'SD_TIC' | 'DIRECTEUR'
  | 'PROF_LABO' | 'TECHNICIEN' | 'AGENT_ADMIN'
  | 'TECHNICIEN_PRESTATAIRE' | 'SD_BATIMENTS' | 'INSPECTEUR' | 'COORDINATEUR';

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
  etablissementId?: string;
  laboId?: string;
  avatar: string;
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
    this.restoreSession();
  }

  public get currentUserValue(): UserAccount | null {
    return this.currentUserSubject.value;
  }

  changerMotDePasse(ancienMotDePasse: string, nouveauMdp: string): Observable<{ success: boolean; message: string }> {
    const ancien = ancienMotDePasse || '';
    const nouveau = nouveauMdp || '';

    if (!ancien) return of({ success: false, message: 'Veuillez saisir votre mot de passe actuel.' });
    if (nouveau.length < 8) return of({ success: false, message: 'Le mot de passe doit comporter au moins 8 caractères.' });

    return this.http.post<{ success?: boolean; message?: string }>(`${this.apiUrl}/change-password`, {
      ancienMotDePasse: ancien,
      nouveauMotDePasse: nouveau,
    }).pipe(
      map((response) => ({
        success: response.success !== false,
        message: response.message || 'Votre mot de passe a été mis à jour.',
      })),
      catchError((error: HttpErrorResponse) => of({
        success: false,
        message: this.genericHttpMessage(error),
      }))
    );
  }

  login(credentials: { identifiant: string; motDePasse?: string }): Observable<{ success: boolean; message?: string }> {
    const identifiant = (credentials.identifiant || '').trim();
    const motDePasse = credentials.motDePasse || '';
    if (!identifiant) return of({ success: false, message: 'Veuillez saisir votre adresse e-mail institutionnelle ou matricule.' });
    if (!motDePasse) return of({ success: false, message: 'Veuillez saisir votre mot de passe.' });

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
          ? this.genericHttpMessage(error)
          : 'Erreur de réponse du serveur.';
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

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !!this.currentUserSubject.value && this.tokenIsNotExpired(token);
  }

  hasRole(allowedRoles: UserRole[]): boolean {
    const user = this.currentUserValue;
    return !!user && allowedRoles.includes(user.role);
  }

  private restoreSession(): void {
    const token = localStorage.getItem('token');
    const rawUser = localStorage.getItem('suivitic_user');
    if (!token || !rawUser || !this.tokenIsNotExpired(token)) {
      this.logout();
      return;
    }
    try {
      const user = JSON.parse(rawUser) as UserAccount;
      if (user?.id && user?.role) {
        user.role = this.normalizeRole(user.role);
        this.currentUserSubject.next(user);
      }
    } catch {
      this.logout();
    }
  }

  private tokenIsNotExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp !== 'number' || payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private genericHttpMessage(error: HttpErrorResponse): string {
    if (error.status === 401) return 'Identifiants incorrects ou session expirée.';
    if (error.status === 403) return 'Accès refusé.';
    if (error.status === 400) return 'Les données fournies sont invalides.';
    return 'Impossible de joindre le serveur pour le moment.';
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
      perimetre: '',
      creId: apiUser?.creId,
      etablissementId: apiUser?.etablissementId,
      laboId: apiUser?.laboId,
      avatar: '👤',
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
      AGENT_ADMIN: 'AGENT_ADMIN', INSPECTEUR: 'INSPECTEUR', COORDINATEUR: 'COORDINATEUR',
    };
    return role ? (mapping[role] || 'AGENT_ADMIN') : 'AGENT_ADMIN';
  }

  redirectUserByRole(role: UserRole): void {
    const routes: Record<UserRole, string> = {
      ADMIN_CENTRAL: '/admin-central', ADMIN_ADJOINT: '/admin-central', SD_TIC: '/sd-tic',
      DIRECTEUR: '/directeur', PROF_LABO: '/prof', TECHNICIEN: '/technicien',
      AGENT_ADMIN: '/agent-admin', TECHNICIEN_PRESTATAIRE: '/technicien-prestataire',
      SD_BATIMENTS: '/sd-batiments', INSPECTEUR: '/inspecteur', COORDINATEUR: '/coordinateur',
    };
    this.router.navigate([routes[role] || '/login']);
  }

  getDashboardUrlForCurrent(): string {
    const user = this.currentUserValue;
    return user ? this.dashboardRoute(user.role) : '/login';
  }

  private dashboardRoute(role: UserRole): string {
    const routes: Record<UserRole, string> = {
      ADMIN_CENTRAL: '/admin-central', ADMIN_ADJOINT: '/admin-central', SD_TIC: '/sd-tic',
      DIRECTEUR: '/directeur', PROF_LABO: '/prof', TECHNICIEN: '/technicien',
      AGENT_ADMIN: '/agent-admin', TECHNICIEN_PRESTATAIRE: '/technicien-prestataire',
      SD_BATIMENTS: '/sd-batiments', INSPECTEUR: '/inspecteur', COORDINATEUR: '/coordinateur',
    };
    return routes[role] || '/login';
  }
}
