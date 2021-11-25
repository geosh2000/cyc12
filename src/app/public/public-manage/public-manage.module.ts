import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';

import { PublicManageComponent } from './public-manage.component';

import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';

import { NavbarDetailsComponent } from './navbar-details/navbar-details.component';
import { ItemListComponent } from './item-list/item-list.component';
import { HomeComponentPM } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FullRsvComponent } from './dashboard/full-rsv/full-rsv.component';
import { ItemRsvComponent } from './dashboard/item-rsv/item-rsv.component';
import { HotelItemComponent } from './dashboard/hotel-item/hotel-item.component';
import { MainViewPMComponent } from './main-view/main-view.component';
import { PmStartComponent } from './pm-start/pm-start.component';
import { NotFoundPMComponent } from './not-found/not-found.component';
import { ConfirmWidgetComponent } from './dashboard/confirm-widget/confirm-widget.component';




@NgModule({ 
  declarations: [
    PublicManageComponent,

    NavbarDetailsComponent,
    ItemListComponent,
    MainViewPMComponent,
    HomeComponentPM,
    DashboardComponent,
    FullRsvComponent,
    ItemRsvComponent,
    HotelItemComponent,
    NotFoundPMComponent,
    ConfirmWidgetComponent,

    PmStartComponent,
  ],
  exports: [
    PublicManageComponent,

    NavbarDetailsComponent,
    ItemListComponent,
    MainViewPMComponent,
    HomeComponentPM,
    NotFoundPMComponent,
    DashboardComponent,
    FullRsvComponent,
    ItemRsvComponent,
    HotelItemComponent,
    ConfirmWidgetComponent,
    PmStartComponent,
  ],
  imports: [    
    SharedModule,

    MatSliderModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTabsModule,
    MatGridListModule,
    MatCardModule,
    MatExpansionModule,
    MatDividerModule,
 
  ]
})
export class PublicManageModule { }
