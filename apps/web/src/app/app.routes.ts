import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { InterventionsListComponent } from './features/interventions/interventions-list/interventions-list.component';
import { DirecteurDashboardComponent } from './features/directeur/directeur-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'directeur', component: DirecteurDashboardComponent },
  { path: 'interventions', component: InterventionsListComponent }
];