import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

/**
 * HTTP Interceptor for handling authentication tokens
 * - Validates token before making request and refreshes if needed
 * - Adds Authorization header to requests
 * - Handles token refresh on 401 errors
 * - Handles 403 forbidden errors
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip token attachment for login, register, refresh, and logout endpoints
  const skipAuth =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/logout');

  if (skipAuth) {
    return next(req);
  }

  // Get current access token
  const accessToken = tokenService.getAccessToken();

  // If no token, proceed without auth header
  if (!accessToken) {
    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Unauthorized without token - redirect to login
          router.navigate(['/auth/login']);
          return throwError(() => error);
        }
        if (error.status === 403) {
          router.navigate(['/unauthorized']);
        }
        return throwError(() => error);
      }),
    );
  }

  // Token exists - check if it's expired BEFORE making the request
  const isExpired = tokenService.isTokenExpired(accessToken);

  if (isExpired) {
    // Token is expired - try to refresh before making the request
    const refreshToken = tokenService.getRefreshToken();

    if (!refreshToken) {
      // No refresh token - clear session and reject request
      authService.clearSessionAndLogout();
      return throwError(() => new Error('Session expired'));
    }

    // Attempt SILENT refresh BEFORE the request (don't disrupt UI)
    return authService.silentRefreshToken(refreshToken).pipe(
      switchMap((response) => {
        // Successfully refreshed - retry request with new token
        return next(addToken(req, response.accessToken));
      }),
      catchError((error) => {
        // Refresh failed - clear session and redirect
        authService.clearSessionAndLogout();
        return throwError(() => error);
      }),
    );
  }

  // Token is valid - attach it and make the request
  req = addToken(req, accessToken);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 errors (token expired mid-request)
      if (error.status === 401) {
        return handle401Error(req, next, tokenService, authService);
      }

      // Handle 403 errors (forbidden - authenticated but not authorized)
      if (error.status === 403) {
        router.navigate(['/unauthorized']);
      }

      return throwError(() => error);
    }),
  );
};

/**
 * Add Authorization header to request
 */
function addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * State for managing token refresh
 */
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Handle 401 errors by refreshing the token
 * If refresh fails, clear session and redirect to login
 */
function handle401Error(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  tokenService: TokenService,
  authService: AuthService,
): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = tokenService.getRefreshToken();

    if (refreshToken) {
      return authService.silentRefreshToken(refreshToken).pipe(
        switchMap((response) => {
          isRefreshing = false;
          refreshTokenSubject.next(response.accessToken);
          return next(addToken(request, response.accessToken));
        }),
        catchError((error) => {
          isRefreshing = false;
          // Refresh failed: clear session and redirect to login
          authService.clearSessionAndLogout();
          return throwError(() => error);
        }),
      );
    } else {
      isRefreshing = false;
      // No refresh token: clear session and redirect to login
      authService.clearSessionAndLogout();
      return throwError(() => new Error('No refresh token available'));
    }
  } else {
    // Wait for token refresh to complete
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next(addToken(request, token!))),
      catchError((error) => {
        // If refresh failed while waiting, clear session
        isRefreshing = false;
        authService.clearSessionAndLogout();
        return throwError(() => error);
      }),
    );
  }
}
