import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { roleGuard } from './core/auth/guards/role.guard';

export const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },

  // Auth routes (public)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // Protected routes with admin layout
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        title: 'Dashboard - Yurakuna',
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.routes').then((m) => m.PRODUCTS_ROUTES),
      },
      {
        path: 'clients',
        loadChildren: () =>
          import('./features/clients/clients.routes').then((m) => m.CLIENTS_ROUTES),
      },
      {
        path: 'stock',
        loadChildren: () => import('./features/stock/stock.routes').then((m) => m.STOCK_ROUTES),
      },
      {
        path: 'shrinkage',
        loadChildren: () =>
          import('./features/shrinkage/shrinkage.routes').then((m) => m.SHRINKAGE_ROUTES),
      },
      {
        path: 'deliveries',
        loadChildren: () =>
          import('./features/deliveries/deliveries.routes').then((m) => m.DELIVERIES_ROUTES),
      },
      {
        path: 'orders',
        loadChildren: () => import('./features/orders/orders.routes').then((m) => m.ORDERS_ROUTES),
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: 'providers',
        loadChildren: () =>
          import('./features/providers/providers.routes').then((m) => m.PROVIDERS_ROUTES),
      },
      {
        path: 'purchases',
        loadChildren: () =>
          import('./features/purchases/purchases.routes').then((m) => m.PURCHASES_ROUTES),
      },
    ],
  },

  // Unauthorized page
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./shared/pages/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent,
      ),
    title: 'Acceso Denegado - Yurakuna',
  },

  // Fallback route - redirect to dashboard (will be caught by authGuard if not authenticated)
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
