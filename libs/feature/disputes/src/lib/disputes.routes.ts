import type { Routes } from '@angular/router';
import { provideUiIcons } from '@gscf/ui-common';
import { DisputesOverview } from './disputes-overview';

export const disputesRoutes: Routes = [
  { path: '', component: DisputesOverview, providers: [provideUiIcons()] },
];
