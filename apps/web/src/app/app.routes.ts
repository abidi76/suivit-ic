import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { AdminCentralDashboardComponent } from './features/admin-central/admin-central-dashboard.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DirecteurDashboardComponent } from './features/directeur/directeur-dashboard.component';
import { ProfDashboardComponent } from './features/prof/prof-dashboard.component';
import { TechnicienDashboardComponent } from './features/technicien/technicien-dashboard.component';
import { AgentAdminDashboardComponent } from './features/agent-admin/agent-admin-dashboard.component';
import { TechnicienPrestataireDashboardComponent } from './features/technicien-prestataire/technicien-prestataire-dashboard.component';
import { SdBatimentsDashboardComponent } from './features/sd-batiments/sd-batiments-dashboard.component';
import { InterventionsListComponent } from './features/interventions/interventions-list/interventions-list.component';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'admin-central', 
    component: AdminCentralDashboardComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['ADMIN_CENTRAL', 'ADMIN_ADJOINT'] } 
  },
  { 
    path: 'sd-tic', 
    component: DashboardComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['SD_TIC'] } 
  },
  { 
    path: 'directeur', 
    component: DirecteurDashboardComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['DIRECTEUR'] } 
  },
  { 
    path: 'prof', 
    component: ProfDashboardComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['PROF_LABO'] } 
  },
  { 
    path: 'technicien', 
    component: TechnicienDashboardComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['TECHNICIEN'] } 
  },
  { 
    path: 'agent-admin', 
    component: AgentAdminDashboardComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['AGENT_ADMIN'] } 
  },
  { 
    path: 'technicien-prestataire', 
    component: TechnicienPrestataireDashboardComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['TECHNICIEN_PRESTATAIRE'] } 
  },
  { 
    path: 'sd-batiments', 
    component: SdBatimentsDashboardComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['SD_BATIMENTS'] } 
  },
  { 
    path: 'interventions', 
    component: InterventionsListComponent, 
    canActivate: [authGuard] 
  },
  { path: 'dashboard', redirectTo: 'sd-tic', pathMatch: 'full' },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];