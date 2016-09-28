import { Component, OnInit } from '@angular/core';
// import { NameListService } from '../shared/index';

import { AuthHttp } from 'angular2-jwt/angular2-jwt';

/**
 * This class represents the lazy loaded HomeComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'sd-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css'],
})

export class HomeComponent implements OnInit {

  // newName: string = '';
  errorMessage: string;
  // names: any[] = [];

  /**
   * Creates an instance of the HomeComponent with the injected
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
  }

}
