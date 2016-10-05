import { Component, OnInit } from '@angular/core';
// import { NameListService } from '../shared/index';

import { AuthHttp } from 'angular2-jwt/angular2-jwt';

/**
 * This class represents the lazy loaded DashboardComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'router-outlet',
  templateUrl: 'dashboard.component.html',
  // styleUrls: ['dashboard.component.css'],
})

export class DashboardComponent implements OnInit {

  // newName: string = '';
  errorMessage: string;
  // names: any[] = [];

  /**
   * Creates an instance of the DashboardComponent with the injected
   * NameListService.
   *
   * @param {NameListService} nameListService - The injected NameListService.
   */
  constructor(public auth: AuthHttp) { }

  /**
   * Get the names OnInit
   */
  ngOnInit() {
    console.log(this.auth);
    // alert(this.auth);
  }

}
