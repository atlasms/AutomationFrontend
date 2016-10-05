import { Route } from '@angular/router';
import { DashboardComponent } from './index';
import { BroadcastRoutes } from './../broadcast/broadcast.routes';
import { WebsiteRoutes } from './../website/website.routes';
import { AuthGuard } from './../../shared/_guards/index';

export const DashboardRoutes: Route[] = [
  {
    path: "dashboard", component: DashboardComponent, canActivate: [AuthGuard]
    , children:
    [
      ...BroadcastRoutes,
      ...WebsiteRoutes,
    ]
  }
  // , { path: 'broadcast', component: BroadcastComponent },
];