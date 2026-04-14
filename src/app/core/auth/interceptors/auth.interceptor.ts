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

  // Add token to request if available
  const accessToken = tokenService.getAccessToken();

  if (accessToken) {
    req = addToken(req, accessToken);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 errors (unauthorized)
      if (error.status === 401 && !skipAuth) {
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
      return authService.refreshToken(refreshToken).pipe(
        switchMap((response) => {
          isRefreshing = false;
          refreshTokenSubject.next(response.accessToken);
          return next(addToken(request, response.accessToken));
        }),
        catchError((error) => {
          isRefreshing = false;
          authService.logout();
          return throwError(() => error);
        }),
      );
    } else {
      authService.logout();
      return throwError(() => new Error('No refresh token available'));
    }
  } else {
    // Wait for token refresh to complete
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next(addToken(request, token!))),
    );
  }
}
