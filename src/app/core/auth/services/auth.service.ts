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
   * Refresh access token
   */
  refreshToken(refreshToken: string): Observable<AuthResponse> {
    const payload: RefreshTokenRequest = { refreshToken };
    return this.apiService
      .post<AuthResponse>('/auth/refresh', payload)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  /**
   * Logout user
   */
  logout(): void {
    const refreshToken = this.tokenService.getRefreshToken();

    if (refreshToken) {
      // Call logout endpoint (fire and forget)
      this.apiService.post('/auth/logout', { refreshToken }).subscribe();
    }

    this.clearSession();
    this.router.navigate(['/auth/login']);
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
   */
  private handleAuthResponse(response: AuthResponse): void {
    this.tokenService.setAccessToken(response.accessToken);
    this.tokenService.setRefreshToken(response.refreshToken);
    this.tokenService.setUser(response.user);
    this.currentUser.set(response.user);
  }

  /**
   * Clear session data
   */
  private clearSession(): void {
    this.tokenService.clearTokens();
    this.currentUser.set(null);
  }
}
