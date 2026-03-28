import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./product-list/product-list.component').then((m) => m.ProductListComponent),
    title: 'Productos - Yurakuna',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./product-form/product-form.component').then((m) => m.ProductFormComponent),
    title: 'Nuevo Producto - Yurakuna',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./product-form/product-form.component').then((m) => m.ProductFormComponent),
    title: 'Editar Producto - Yurakuna',
  },
];
