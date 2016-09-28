import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

import { AboutModule } from './about/about.module';
import { HomeModule } from './home/home.module';
import { SharedModule } from './shared/shared.module';

// import {Http, HTTP_PROVIDERS} from '@angular/http';
import { Http } from '@angular/http';
import { AuthHttp, AuthConfig } from 'angular2-jwt';


@NgModule({
  imports: [BrowserModule, HttpModule, RouterModule.forRoot(routes), AboutModule, HomeModule, SharedModule.forRoot()],
  declarations: [AppComponent],
  providers: [{
    provide: APP_BASE_HREF,
    useValue: '<%= APP_BASE %>'
  }, {
    provide: AuthHttp,
    useFactory: (http: Http) => {
      return new AuthHttp(new AuthConfig(), http);
    },
    deps: [Http]
  }],
  bootstrap: [AppComponent]

})

export class AppModule { }
