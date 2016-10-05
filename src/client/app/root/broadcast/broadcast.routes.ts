import { Route } from '@angular/router';
import { AuthGuard } from './../../shared/_guards/index';
import { BroadcastComponent } from './index';
import { ScheduleComponent } from './schedule/index';

export const BroadcastRoutes: Route[] = [
  { path: 'broadcast', component: BroadcastComponent, data: {breadcrumb: 'پخش و تامین'} },
  { path: 'broadcast/schedule', component: ScheduleComponent, data: {breadcrumb: 'کنداکتور'} },
];