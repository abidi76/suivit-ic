import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

/**
 * Le comportement mock est désactivé définitivement.
 * Toutes les données passent uniquement par l'API réelle.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) =>
  throwError(() => new Error('Le mock API est désactivé. Utilisez uniquement le backend HTTP réel.'));
