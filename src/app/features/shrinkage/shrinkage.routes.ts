import { Routes } from '@angular/router';

export const SHRINKAGE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shrinkage-list/shrinkage-list.component').then((m) => m.ShrinkageListComponent),
    title: 'Mermas - Yurakuna',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./shrinkage-form/shrinkage-form.component').then((m) => m.ShrinkageFormComponent),
    title: 'Registrar Merma - Yurakuna',
  },
];
