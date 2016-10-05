import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

// import { AboutModule } from './about/about.module';
// import { HomeModule } from './home/home.module';
import { SharedModule } from './shared/shared.module';
import { LoginModule } from './login/login.module';

// import {Http, HTTP_PROVIDERS} from '@angular/http';
import { Http } from '@angular/http';
import { AuthHttp, AuthConfig } from 'angular2-jwt';

import { AuthGuard } from './shared/_guards/index';
import { AuthenticationService, UserService } from './shared/_services/index';
// import { LoginComponent } from './login/index';
import { RootModule } from './root/root.module';


@NgModule({
  imports: [BrowserModule, HttpModule, RouterModule.forRoot(routes), RootModule, LoginModule, SharedModule.forRoot()],
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
  },
    AuthGuard,
    AuthenticationService,
    UserService,
    // appRoutingProviders
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
