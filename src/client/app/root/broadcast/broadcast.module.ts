import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BroadcastComponent } from './broadcast.component';
import { ScheduleComponent } from './schedule/schedule.component';

@NgModule({
    imports: [CommonModule],
    declarations: [BroadcastComponent, ScheduleComponent],
    exports: [BroadcastComponent, ScheduleComponent]
})

export class BroadcastModule { }
