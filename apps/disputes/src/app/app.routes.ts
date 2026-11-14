import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'disputes' },
  {
    path: 'disputes',
    loadChildren: () => import('@gscf/disputes-feature').then((feature) => feature.disputesRoutes),
  },
  { path: '**', redirectTo: 'disputes' },
];
