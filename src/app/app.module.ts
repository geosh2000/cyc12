import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from '../environments/environment';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = { url: environment.wsUrl, options: {} };

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';

import { NotFoundComponent } from './components/not-found/not-found.component';


import { ApiService } from './services/api.service';
import { InitService } from './services/init.service';
import { ZonaHorariaService } from './services/zona-horaria.service';
import { WsService } from './services/ws.service';

import { LoginService } from './services/login.service';
// import { CotizadorModule } from './components/cotizador/cotizador.module';
import { MainViewModule } from './components/main-view/main-view.module';

@NgModule({
  declarations: [
    AppComponent,

    NotFoundComponent,
    
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    
    ToastrModule.forRoot(),
    SocketIoModule.forRoot(config),

    AppRoutingModule,
    // CotizadorModule,
    MainViewModule,
  ],
  providers: [
    ApiService,
    InitService,
    ZonaHorariaService,
    LoginService,
    WsService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
