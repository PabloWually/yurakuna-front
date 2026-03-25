import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { roleGuard } from './core/auth/guards/role.guard';

export const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  
  // Auth routes (public)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  
  // Protected routes with admin layout
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard - Yurakuna'
      },
      // TODO: Add more feature routes here as they are developed
      // {
      //   path: 'products',
      //   loadChildren: () => import('./features/products/products.routes').then(m => m.PRODUCTS_ROUTES)
      // },
    ]
  },
  
  // Unauthorized page
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
    title: 'Acceso Denegado - Yurakuna'
  },
  
  // Fallback route
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
