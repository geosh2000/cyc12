import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMomentDateModule } from '@angular/material-moment-adapter'
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainViewComponent } from './components/main-view/main-view.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from './components/main-view/navbar/navbar.component';
import { MenuComponent } from './components/main-view/menu/menu.component';
import { ApiService } from './services/api.service';
import { ToastrModule } from 'ngx-toastr';
import { InitService } from './services/init.service';
import { ZonaHorariaService } from './services/zona-horaria.service';
import { CotizadorComponent } from './components/cotizador/cotizador.component';
import { CotizaHotelComponent } from './components/cotizador/hotel/hotel.component';
import { CotizaVcmComponent } from './components/cotizador/vcm/vcm.component';
import { CotizaToursComponent } from './components/cotizador/tours/tours.component';
import { CotizaTrasladosComponent } from './components/cotizador/traslados/traslados.component';
import { CotizaConciertosComponent } from './components/cotizador/conciertos/conciertos.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { CapitalizadoPipe } from './pipes/capitalizado.pipe';
import { LowercasePipe } from './pipes/lowercase.pipe';
import { OrderModule } from 'ngx-order-pipe';
import { KeysPipe } from './pipes/keys.pipe';

@NgModule({
  declarations: [
    AppComponent,
    MainViewComponent,
    NavbarComponent,
    MenuComponent,
    CotizadorComponent,
    CotizaHotelComponent,
    CotizaVcmComponent,
    CotizaToursComponent,
    CotizaTrasladosComponent,
    CotizaConciertosComponent,
    CapitalizadoPipe,
    LowercasePipe,
    KeysPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
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
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    MatMomentDateModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    ToastrModule.forRoot(),
    OrderModule,
  ],
  providers: [
    ApiService,
    InitService,
    ZonaHorariaService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
