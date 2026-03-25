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
  
  // TODO: Auth routes will be added in Phase 2
  // {
  //   path: 'auth',
  //   loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  // },
  
  // TODO: Protected routes will be added as components are created
  // {
  //   path: 'dashboard',
  //   canActivate: [authGuard],
  //   loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
  //   children: []
  // },
  
  // Fallback route
  {
    path: '**',
    redirectTo: '/'
  }
];
