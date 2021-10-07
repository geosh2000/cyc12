import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from 'src/app/app-routing.module';

import { SharedModule } from 'src/app/shared/shared.module';

import { GoToLocComponent } from './go-to-loc/go-to-loc.component';
import { MainViewComponent } from './main-view.component';
import { MenuComponent } from './menu/menu.component';
import { NavbarComponent, LoginDialog } from './navbar/navbar.component';

import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { PagosModule } from '../pagos/pagos.module';
import { CotizadorModule } from '../cotizador/cotizador.module';
import { BlankComponent } from './blank/blank.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';

@NgModule({
  declarations: [
    MainViewComponent,
    NavbarComponent, LoginDialog,
    MenuComponent,
    BreadcrumbsComponent,
    GoToLocComponent,
    BlankComponent,
  ],
  exports: [
    MainViewComponent,
    NavbarComponent, LoginDialog,
    MenuComponent,
    BreadcrumbsComponent,
    GoToLocComponent,
    BlankComponent,
  ],
  imports: [
    SharedModule,

    CotizadorModule,
    PagosModule,

    MatToolbarModule,
    MatSidenavModule,
    MatExpansionModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressBarModule,
  ]
})
export class MainViewModule { }
