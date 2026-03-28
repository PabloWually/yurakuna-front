import { Routes } from '@angular/router';

export const STOCK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./stock-list/stock-list.component').then((m) => m.StockListComponent),
    title: 'Stock - Yurakuna',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./stock-form/stock-form.component').then((m) => m.StockFormComponent),
    title: 'Nuevo Movimiento - Yurakuna',
  },
];
