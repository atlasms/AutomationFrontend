import { Component, OnInit } from '@angular/core';
import { Config } from './shared/index';
import { Router, CanActivate, ActivatedRoute } from '@angular/router';

import { AppModule } from './app.module';
import { BreadcrumbsComponent } from './shared/_helpers/breadcrumbs';
/**
 * This class represents the main application component. Within the @Routes annotation is the configuration of the
 * applications routes, configuring the paths for the lazy loaded components (HomeComponent, AboutComponent).
 */
@Component({
  moduleId: module.id,
  selector: 'sd-app',
  templateUrl: 'app.component.html',
})

export class AppComponent implements OnInit {
  constructor(private _router: Router) {
    console.log('Environment config', Config);
    _router.events.subscribe((events) => console.log(events));
    // console.log(_router.routerState);
    // let breadcrumbs = new BreadcrumbsComponent(_router, ActivatedRoute);
  }
  ngOnInit() {
    // console.log(this._router)
  }
}
