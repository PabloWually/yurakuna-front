import { Injectable, inject, OnDestroy } from '@angular/core';
import { Subject, interval, takeUntil, switchMap, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SessionValidatorService } from './session-validator.service';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';

/**
 * Token Refresh Manager Service
 * 
 * Handles background token validation and refresh:
 * 1. Monitors token expiry continuously (every 30s)
 * 2. Refreshes tokens BEFORE they expire (proactive, not reactive)
 * 3. Maintains seamless user experience without interruptions
 */
@Injectable({
  providedIn: 'root',
})
export class TokenRefreshManagerService implements OnDestroy {
  private sessionValidator = inject(SessionValidatorService);
  private tokenService = inject(TokenService);
  private authService = inject(AuthService);

  private destroy$ = new Subject<void>();

  // Refresh check every 30 seconds
  private readonly REFRESH_CHECK_INTERVAL = 30_000;

  // Refresh token when it has less than 5 minutes left
  private readonly REFRESH_THRESHOLD = 5 * 60_000;

  constructor() {
    this.initializeTokenRefreshCycle();
  }

  /**
   * Initialize background token refresh cycle
   * Checks token expiry every 30 seconds and refreshes if needed
   * This is the ONLY active validation - keeps it simple and non-intrusive
   */
  private initializeTokenRefreshCycle(): void {
    interval(this.REFRESH_CHECK_INTERVAL)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          // Check if token is close to expiry
          const timeUntilExpiry = this.sessionValidator.getTimeUntilExpiry();

          // If token expires soon (< 5 min) and we have a refresh token, refresh now
          if (timeUntilExpiry > 0 && timeUntilExpiry < this.REFRESH_THRESHOLD) {
            console.log(
              `[Token Refresh] Token expiring soon (${Math.round(timeUntilExpiry / 1000)}s), refreshing now`,
            );
            const refreshToken = this.tokenService.getRefreshToken();
            if (refreshToken) {
              // Use SILENT refresh to avoid UI disruptions
              return this.authService.silentRefreshToken(refreshToken).pipe(
                tap(() => console.log('[Token Refresh] Token refreshed successfully')),
              );
            }
          }

          // If token already expired, the guard or interceptor will handle it
          if (timeUntilExpiry <= 0) {
            console.log('[Token Refresh] Token expired, next request will trigger refresh via interceptor');
          }

          return of(null);
        }),
      )
      .subscribe({
        error: (err) => console.error('[Token Refresh] Background refresh error:', err),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
