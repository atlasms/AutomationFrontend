import { Route } from '@angular/router';
import { RootComponent } from './index';
import { DashboardRoutes } from './dashboard/dashboard.routes';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BroadcastRoutes } from './broadcast/broadcast.routes';
import { WebsiteRoutes } from './website/website.routes';
import { AuthGuard } from './../shared/_guards/index';

export const RootRoutes: Route[] = [
  {
    path: "",
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  ...BroadcastRoutes,
  ...WebsiteRoutes,
];