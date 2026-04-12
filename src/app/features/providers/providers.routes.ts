import { Routes } from '@angular/router';

export const PROVIDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./provider-list/provider-list.component').then((m) => m.ProviderListComponent),
    title: 'Proveedores - Yurakuna',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./provider-form/provider-form.component').then((m) => m.ProviderFormComponent),
    title: 'Nuevo Proveedor - Yurakuna',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./provider-form/provider-form.component').then((m) => m.ProviderFormComponent),
    title: 'Editar Proveedor - Yurakuna',
  },
];
