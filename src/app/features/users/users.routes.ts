import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/guards/role.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { requiredRole: 'admin' },
    loadComponent: () => import('./user-list/user-list.component').then((m) => m.UserListComponent),
    title: 'Usuarios - Yurakuna',
  },
  {
    path: 'new',
    canActivate: [roleGuard],
    data: { requiredRole: 'admin' },
    loadComponent: () => import('./user-form/user-form.component').then((m) => m.UserFormComponent),
    title: 'Nuevo Usuario - Yurakuna',
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard],
    data: { requiredRole: 'admin' },
    loadComponent: () => import('./user-form/user-form.component').then((m) => m.UserFormComponent),
    title: 'Editar Usuario - Yurakuna',
  },
];
