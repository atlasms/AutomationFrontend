import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { RootComponent } from './root.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { BroadcastModule } from './broadcast/broadcast.module';
import { WebsiteModule } from './website/website.module';

@NgModule({
  imports: [RouterModule, CommonModule, SharedModule, DashboardModule, BroadcastModule, WebsiteModule],
  declarations: [RootComponent],
  exports: [RootComponent]
})
export class RootModule { }
