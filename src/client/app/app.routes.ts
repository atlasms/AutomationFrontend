import { ModuleWithProviders } from '@angular/core';
// import { Routes, RouterModule, provideRoutes } from '@angular/router';
import { Routes } from '@angular/router';

// import { HomeRoutes } from './home/index';
import { RootRoutes } from './root/index';

import { LoginComponent } from './login/index';
// import { HomeComponent } from './home/index';
import { AuthGuard } from './shared/_guards/index';
// import { DashboardComponent } from './dashboard/index';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  ...RootRoutes,
  // { path: '', redirectTo: 'dashboard', pathMatch: 'full', canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'dashboard', canActivate: [AuthGuard] }
];

// export const appRoutingProviders: any[] = [
//   provideRoutes(routes)
// ];

// export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
