import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./order-list/order-list.component').then((m) => m.OrderListComponent),
    title: 'Pedidos - Yurakuna',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./order-form/order-form.component').then((m) => m.OrderFormComponent),
    title: 'Nuevo Pedido - Yurakuna',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./order-form/order-form.component').then((m) => m.OrderFormComponent),
    title: 'Editar Pedido - Yurakuna',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./order-detail/order-detail.component').then((m) => m.OrderDetailComponent),
    title: 'Detalle de Pedido - Yurakuna',
  },
];
