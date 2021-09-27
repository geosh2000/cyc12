import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from 'src/app/app-routing.module';

import { SharedModule } from 'src/app/shared/shared.module';

import { GoToLocComponent } from './go-to-loc/go-to-loc.component';
import { MainViewComponent } from './main-view.component';
import { MenuComponent } from './menu/menu.component';
import { NavbarComponent, LoginDialog } from './navbar/navbar.component';

import { CotizadorModule } from '../cotizador/cotizador.module';

@NgModule({
  declarations: [
    MainViewComponent,
    NavbarComponent, LoginDialog,
    MenuComponent,
    GoToLocComponent,
  ],
  exports: [
    MainViewComponent,
    NavbarComponent, LoginDialog,
    MenuComponent,
    GoToLocComponent,
  ],
  imports: [
    SharedModule,
    CotizadorModule,
  ]
})
export class MainViewModule { }
