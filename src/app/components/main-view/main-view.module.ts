import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from 'src/app/app-routing.module';

import { SharedModule } from 'src/app/shared/shared.module';

import { GoToLocComponent } from './go-to-loc/go-to-loc.component';
import { MainViewComponent } from './main-view.component';
import { MenuComponent } from './menu/menu.component';
import { NavbarComponent, LoginDialog } from './navbar/navbar.component';

import { PagosModule } from '../pagos/pagos.module';
import { CotizadorModule } from '../cotizador/cotizador.module';
import { ConfigModule } from '../config/config.module';

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

import { BlankComponent } from './blank/blank.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { AccountConfigComponent } from './account-config/account-config.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { RsvModule } from '../rsv/rsv.module';
import { MonitoresModule } from '../monitores/monitores.module';
import { TalkWidgetComponent } from './talk-widget/talk-widget.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TicketWidgetComponent } from './ticket-widget/ticket-widget.component';

@NgModule({
  declarations: [
    MainViewComponent,
    NavbarComponent, LoginDialog,
    AccountConfigComponent,
    MenuComponent,
    BreadcrumbsComponent,
    GoToLocComponent,
    BlankComponent,
    TalkWidgetComponent,
    TicketWidgetComponent,
  ],
  exports: [
    MainViewComponent,
    NavbarComponent, LoginDialog,
    AccountConfigComponent,
    MenuComponent,
    BreadcrumbsComponent,
    GoToLocComponent,
    BlankComponent,
    TalkWidgetComponent,
    TicketWidgetComponent,
  ],
  imports: [
    SharedModule,

    CotizadorModule,
    PagosModule,
    ConfigModule,
    RsvModule,
    MonitoresModule,

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
    MatDividerModule,
    MatListModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatProgressSpinnerModule,
  ]
})
export class MainViewModule { }
