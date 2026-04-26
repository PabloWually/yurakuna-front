import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

/**
 * Session Validator Service
 * Handles proactive token refresh and session validation
 * Ensures that tokens are valid before allowing navigation
 */
@Injectable({
  providedIn: 'root',
})
export class SessionValidatorService {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  /**
   * Validate session: check if token is valid and refresh if needed
   * This is called before navigation to ensure we have a valid token
   */
  validateSession(): Observable<boolean> {
    // No token at all -> invalid session
    if (!this.tokenService.getAccessToken()) {
      return of(false);
    }

    const accessToken = this.tokenService.getAccessToken()!;
    const isExpired = this.tokenService.isTokenExpired(accessToken);

    // Token is valid -> session is valid
    if (!isExpired) {
      return of(true);
    }

    // Token expired, try to refresh
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      // No refresh token -> session is invalid
      return of(false);
    }

    // Attempt silent refresh
    return this.authService.refreshToken(refreshToken).pipe(
      switchMap(() => of(true)),
      catchError(() => {
        // Refresh failed -> session is invalid
        return of(false);
      }),
    );
  }

  /**
   * Check if session is valid without attempting refresh
   * Useful for quick checks
   */
  isSessionValid(): boolean {
    const accessToken = this.tokenService.getAccessToken();
    if (!accessToken) return false;
    return !this.tokenService.isTokenExpired(accessToken);
  }

  /**
   * Invalidate session and redirect to login
   */
  invalidateSession(): void {
    this.authService.clearSessionAndLogout();
  }

  /**
   * Get time until token expires (in milliseconds)
   * Returns negative if token is already expired
   */
  getTimeUntilExpiry(): number {
    const token = this.tokenService.getAccessToken();
    if (!token) return -1;

    try {
      const payload = this.decodeToken(token);
      if (!payload?.exp) return -1;
      return payload.exp * 1000 - Date.now();
    } catch {
      return -1;
    }
  }

  /**
   * Decode JWT token payload
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}
