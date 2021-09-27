import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from '../environments/environment';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = { url: environment.wsUrl, options: {} };

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { OrderModule } from 'ngx-order-pipe';

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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';

import { HttpClientModule } from '@angular/common/http';
import { NavbarComponent,LoginDialog } from './components/main-view/navbar/navbar.component';
import { MenuComponent } from './components/main-view/menu/menu.component';
import { CotizadorComponent } from './components/cotizador/cotizador.component';
import { CotizaHotelComponent, RemoveInsuranceDialog } from './components/cotizador/hotel/hotel.component';
import { CotizaVcmComponent } from './components/cotizador/vcm/vcm.component';
import { CotizaToursComponent } from './components/cotizador/tours/tours.component';
import { CotizaTrasladosComponent } from './components/cotizador/traslados/traslados.component';
import { CotizaConciertosComponent } from './components/cotizador/conciertos/conciertos.component';
import { MainViewComponent } from './components/main-view/main-view.component';
import { GoToLocComponent } from './components/main-view/go-to-loc/go-to-loc.component';
import { SnackBarComponent } from './shared/snack-bar/snack-bar.component';
import { SnackBarTemplateComponent } from './shared/snack-bar-template/snack-bar-template.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { LoginComponent } from './shared/login/login.component';

import { ApiService } from './services/api.service';
import { InitService } from './services/init.service';
import { ZonaHorariaService } from './services/zona-horaria.service';
import { WsService } from './services/ws.service';

import { CapitalizadoPipe } from './pipes/capitalizado.pipe';
import { LowercasePipe } from './pipes/lowercase.pipe';
import { KeysPipe } from './pipes/keys.pipe';
import { LoginService } from './services/login.service';

@NgModule({
  declarations: [
    AppComponent,
    MainViewComponent,
    NavbarComponent, LoginDialog,
    MenuComponent,
    CotizadorComponent,
    CotizaHotelComponent, RemoveInsuranceDialog,
    CotizaVcmComponent,
    CotizaToursComponent,
    CotizaTrasladosComponent,
    CotizaConciertosComponent,
    CapitalizadoPipe,
    LowercasePipe,
    KeysPipe,
    GoToLocComponent,
    SnackBarComponent,
    SnackBarTemplateComponent,
    LoginComponent,
    NotFoundComponent
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
    MatSnackBarModule,
    MatCheckboxModule,
    MatChipsModule,
    MatRadioModule,
    MatDialogModule,
    ToastrModule.forRoot(),
    OrderModule,
    SocketIoModule.forRoot(config),
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
