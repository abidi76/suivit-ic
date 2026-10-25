import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InterventionService {
  private apiUrl = 'http://localhost:3000/interventions';

  constructor(private http: HttpClient) {}

  getInterventions(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createIntervention(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}