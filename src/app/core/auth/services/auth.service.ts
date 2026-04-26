import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { TokenService } from './token.service';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  RefreshTokenRequest,
} from '../../models';

/**
 * Authentication service
 * Handles login, register, logout, and token management
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiService = inject(ApiService);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  // Current user signal — restored from localStorage on startup
  currentUser = signal<User | null>(
    this.tokenService.isAuthenticated() ? this.tokenService.getUser() : null,
  );

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiService
      .post<AuthResponse>('/auth/login', credentials)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  /**
   * Register new user
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.apiService
      .post<AuthResponse>('/auth/register', data)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  /**
   * Refresh access token (for interactive login, updates UI)
   */
  refreshToken(refreshToken: string): Observable<AuthResponse> {
    const payload: RefreshTokenRequest = { refreshToken };
    return this.apiService
      .post<AuthResponse>('/auth/refresh', payload)
      .pipe(tap((response) => this.handleAuthResponse(response, false)));
  }

  /**
   * Silent refresh (for background, does NOT update currentUser signal)
   * Used by interceptor and background service to avoid UI disruptions
   */
  silentRefreshToken(refreshToken: string): Observable<AuthResponse> {
    const payload: RefreshTokenRequest = { refreshToken };
    return this.apiService
      .post<AuthResponse>('/auth/refresh', payload)
      .pipe(tap((response) => this.handleAuthResponse(response, true)));
  }

  /**
   * Logout user
   * Sends token to API, waits for response, then clears local tokens
   */
  logout(): Observable<void> {
    const refreshToken = this.tokenService.getRefreshToken();

    if (!refreshToken) {
      // No token, just clear local session
      this.clearSession();
      return new Observable((observer) => {
        observer.complete();
      });
    }

    // Send logout request with token, wait for response, then clear
    return this.apiService.post<void>('/auth/logout', { refreshToken }).pipe(
      tap(() => {
        this.clearSession();
      }),
    );
  }

  /**
   * Logout from all devices
   */
  logoutAll(): Observable<void> {
    const refreshToken = this.tokenService.getRefreshToken();

    if (!refreshToken) {
      this.clearSession();
      return new Observable((observer) => observer.complete());
    }

    return this.apiService
      .post<void>('/auth/logout-all', { refreshToken })
      .pipe(tap(() => this.clearSession()));
  }

  /**
   * Clear session and redirect to login
   * Called when session is invalid (token refresh fails, etc.)
   */
  clearSessionAndLogout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.tokenService.isAuthenticated();
  }

  /**
   * Get current user role
   */
  getUserRole(): string | null {
    return this.currentUser()?.role || null;
  }

  /**
   * Handle authentication response
   * When isSilent=true, only updates tokens without notifying UI
   * This prevents layout re-renders during background refresh
   */
  private handleAuthResponse(response: AuthResponse, isSilent = false): void {
    this.tokenService.setAccessToken(response.accessToken);
    this.tokenService.setRefreshToken(response.refreshToken);
    this.tokenService.setUser(response.user);
    
    // Only update currentUser signal if not a silent refresh
    // This prevents unnecessary re-renders during background token updates
    if (!isSilent) {
      this.currentUser.set(response.user);
    }
  }

  /**
   * Clear session data
   */
  private clearSession(): void {
    this.tokenService.clearTokens();
    this.currentUser.set(null);
  }
}
