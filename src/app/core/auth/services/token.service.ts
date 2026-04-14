import { Injectable } from '@angular/core';
import { User } from '../../models';

/**
 * Service for managing authentication tokens
 */
@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'yurakuna_access_token';
  private readonly REFRESH_TOKEN_KEY = 'yurakuna_refresh_token';
  private readonly USER_KEY = 'yurakuna_user';

  /**
   * Save access token
   */
  setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Save refresh token
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Save user to localStorage
   */
  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user from localStorage
   */
  getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) return null;
    try {
      return JSON.parse(userData) as User;
    } catch {
      return null;
    }
  }

  /**
   * Remove all tokens and user data
   */
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Check if user is authenticated.
   * Returns true when:
   *   - Access token exists and is not expired, OR
   *   - Access token is expired but a refresh token is available
   *     (the HTTP interceptor will handle the silent refresh transparently)
   */
  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;

    if (this.isTokenExpired(accessToken)) {
      // Expired access token: stay authenticated only if we can refresh
      return !!this.getRefreshToken();
    }

    return true;
  }

  /**
   * Check whether a JWT token is past its expiry date.
   * Adds a 5-second buffer to account for clock skew.
   */
  isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload?.exp) return true;
    return Date.now() >= payload.exp * 1000 - 5_000;
  }

  /**
   * Decode JWT token and get payload
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

  /**
   * Get user ID from access token
   */
  getUserIdFromToken(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    return payload?.sub || payload?.userId || payload?.id || null;
  }
}
