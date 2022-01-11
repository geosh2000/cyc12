import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
// const config: SocketIoConfig = { url: 'https://cyc-socket.herokuapp.com', options: {} };

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';

import { MainViewModule } from './components/main-view/main-view.module';
import { PublicModule } from './public/public.module';
import { NoDobuleClickDirective } from './directives/no-dobule-click.directive';

@NgModule({
  declarations: [
    AppComponent,
    NoDobuleClickDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    
    ToastrModule.forRoot(),
    // SocketIoModule.forRoot(config),

    AppRoutingModule,

    MainViewModule,
    PublicModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
