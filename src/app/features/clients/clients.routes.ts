import { Routes } from '@angular/router';

export const CLIENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./client-list/client-list.component').then((m) => m.ClientListComponent),
    title: 'Clientes - Yurakuna',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./client-form/client-form.component').then((m) => m.ClientFormComponent),
    title: 'Nuevo Cliente - Yurakuna',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./client-form/client-form.component').then((m) => m.ClientFormComponent),
    title: 'Editar Cliente - Yurakuna',
  },
];
