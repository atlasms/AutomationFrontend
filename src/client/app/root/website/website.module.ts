import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteComponent } from './website.component';

@NgModule({
    imports: [CommonModule],
    declarations: [WebsiteComponent],
    exports: [WebsiteComponent]
})

export class WebsiteModule { }
