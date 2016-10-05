import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './dashboard.component';
import { BroadcastComponent } from './../broadcast/broadcast.component';
import { WebsiteComponent } from './../website/website.component';
import { BroadcastModule } from './../broadcast/broadcast.module';
import { WebsiteModule } from './../website/website.module';

@NgModule({
  imports: [RouterModule, CommonModule, SharedModule, BroadcastModule, WebsiteModule],
  declarations: [DashboardComponent],
  exports: [DashboardComponent, BroadcastComponent, WebsiteComponent]
})
export class DashboardModule { }
