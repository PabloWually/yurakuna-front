import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard to protect routes based on user roles
 * Usage: canActivate: [roleGuard], data: { roles: ['admin', 'user'] }
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const userRole = authService.getUserRole();
  const allowedRoles = route.data['roles'] as string[];

  if (!userRole) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (allowedRoles && allowedRoles.includes(userRole)) {
    return true;
  }

  // User doesn't have permission, redirect to unauthorized page
  router.navigate(['/unauthorized']);
  return false;
};
