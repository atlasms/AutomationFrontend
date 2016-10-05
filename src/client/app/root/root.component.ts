import { Component, OnInit } from '@angular/core';
// import { NameListService } from '../shared/index';

import { AuthHttp } from 'angular2-jwt/angular2-jwt';

/**
 * This class represents the lazy loaded RootComponent.
 */
@Component({
  moduleId: module.id,
  // selector: 'sd-app',
  templateUrl: 'root.component.html',
  // styleUrls: ['root.component.css'],
})

export class RootComponent implements OnInit {

  // newName: string = '';
  errorMessage: string;
  // names: any[] = [];

  /**
   * Creates an instance of the RootComponent with the injected
   * NameListService.
   *
   * @param {NameListService} nameListService - The injected NameListService.
   */
  constructor(public auth: AuthHttp) { }

  /**
   * Get the names OnInit
   */
  ngOnInit() {
    // console.log(this.auth);
    // alert(this.auth);
  }

}
