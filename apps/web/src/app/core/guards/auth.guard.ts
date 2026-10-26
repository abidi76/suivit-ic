import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const expectedRoles: UserRole[] = route.data?.['roles'] || [];
  if (expectedRoles.length === 0 || authService.hasRole(expectedRoles)) {
    return true;
  }

  // Redirection immédiate vers le dashboard auquel l'utilisateur a réellement droit
  const properDashboard = authService.getDashboardUrlForCurrent();
  router.navigate([properDashboard]);
  return false;
};