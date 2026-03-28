import { Routes } from '@angular/router';

export const DELIVERIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./delivery-list/delivery-list.component').then((m) => m.DeliveryListComponent),
    title: 'Entregas - Yurakuna',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./delivery-form/delivery-form.component').then((m) => m.DeliveryFormComponent),
    title: 'Nueva Entrega - Yurakuna',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./delivery-form/delivery-form.component').then((m) => m.DeliveryFormComponent),
    title: 'Editar Entrega - Yurakuna',
  },
];
