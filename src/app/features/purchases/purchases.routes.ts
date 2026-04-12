import { Routes } from '@angular/router';

export const PURCHASES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./purchase-list/purchase-list.component').then((m) => m.PurchaseListComponent),
    title: 'Compras - Yurakuna',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./purchase-form/purchase-form.component').then((m) => m.PurchaseFormComponent),
    title: 'Nueva Compra - Yurakuna',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./purchase-form/purchase-form.component').then((m) => m.PurchaseFormComponent),
    title: 'Editar Compra - Yurakuna',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./purchase-detail/purchase-detail.component').then((m) => m.PurchaseDetailComponent),
    title: 'Detalle de Compra - Yurakuna',
  },
];
