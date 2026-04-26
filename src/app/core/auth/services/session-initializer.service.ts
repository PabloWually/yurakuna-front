import { Injectable, inject } from '@angular/core';
import { APP_INITIALIZER } from '@angular/core';
import { SessionValidatorService } from './session-validator.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

/**
 * App Initializer for validating session on startup
 * Ensures that:
 * 1. If user has a valid token, they stay logged in
 * 2. If token is expired but refresh token exists, attempt silent refresh
 * 3. If session is invalid, clear it and prepare for login
 */
@Injectable({
  providedIn: 'root',
})
export class SessionInitializerService {
  private sessionValidator = inject(SessionValidatorService);
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * Initialize session on app startup
   */
  initializeSession(): Promise<void> {
    return new Promise((resolve) => {
      // Quick check: is session currently valid without refresh?
      if (this.sessionValidator.isSessionValid()) {
        console.log('[Auth] Session valid on startup');
        resolve();
        return;
      }

      // Token expired or missing: attempt full validation with refresh
      this.sessionValidator.validateSession().subscribe((isValid) => {
        if (isValid) {
          console.log('[Auth] Session restored via token refresh on startup');
        } else {
          console.log('[Auth] Session invalid on startup - user must login');
          // Silently clear any stale session data
          this.authService.clearSessionAndLogout();
        }
        resolve();
      });
    });
  }
}

/**
 * Factory function to provide the initializer
 */
export function initializeSessionFactory(): () => Promise<void> {
  return () => {
    const initializer = inject(SessionInitializerService);
    return initializer.initializeSession();
  };
}

/**
 * Provider for APP_INITIALIZER
 * Add this to your appConfig providers
 */
export const SESSION_INITIALIZER_PROVIDER = {
  provide: APP_INITIALIZER,
  useFactory: initializeSessionFactory,
  multi: true,
};
