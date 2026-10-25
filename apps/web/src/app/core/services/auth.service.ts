import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: any) {
    const payload = {
      identifiant: credentials.email,
      motDePasse: credentials.password
    };
    return this.http.post<any>(`${this.apiUrl}/login`, payload).pipe(
      tap(res => {
        localStorage.setItem('token', res.accessToken); 
        if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
      })
    );
  }

  // C'est cette fonction qui manquait !
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  getToken() { return localStorage.getItem('token'); }
  isLoggedIn(): boolean { return !!this.getToken(); }
}