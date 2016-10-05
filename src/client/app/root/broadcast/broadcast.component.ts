import { Component, OnInit } from '@angular/core';
// import { BroadcastRoutes } from './broadcast.routes';
// import { routing, appRoutingProviders } from './../../app.routes';

/**
 * This class represents the lazy loaded BroadcastComponent.
 */
@Component({
  moduleId: module.id,
  // selector: 'sd-broadcast',
  templateUrl: 'broadcast.component.html',
  // styleUrls: ['about.component.css']
  // providers: [appRoutingProviders]
})
export class BroadcastComponent implements OnInit {
  activeChildRoute: boolean;
  constructor() { }
  ngOnInit() {
    // let router = BroadcastRoutes;
    let self = this;
    this.activeChildRoute = true; //<---------- Creates DOM so router-outlet is found
    // setTimeout(function () { //<---- Sets timeout to execute function just after view is loaded
    //   // // more code...
    //   // self.activeChildRoute = false; //<------ Now you can remove DOM that contains router-outlet
    // }, 0); //<--------------------------- 0 miliseconds to timeout
  }
}
