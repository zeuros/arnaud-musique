import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'partitions',
    loadComponent: () => import('./pages/sheets/sheets.component').then(m => m.SheetsComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
  },
  { path: '**', redirectTo: '' },
];
