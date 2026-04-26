import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { TokenService } from '../services/token.service';

/**
 * Guard to protect routes that require authentication
 * - Quick synchronous check (no async refresh here)
 * - If token is invalid, redirects to login
 * - Token refresh is handled by interceptor and background service
 */
export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // Quick check: do we have a valid token?
  if (tokenService.isAuthenticated()) {
    return true;
  }

  // Invalid or missing token - redirect to login
  // The interceptor will handle refresh on demand
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};
