import { NgModule } from '@angular/core';

import { CotizaConciertosComponent } from './conciertos/conciertos.component';
import { CotizadorComponent } from './cotizador.component';
// import { CotizadorComponent, RsvCreateDialog } from './cotizador.component';
import { CotizaHotelComponent, RemoveInsuranceDialog } from './hotel/hotel.component';
import { CotizaToursComponent } from './tours/tours.component';
import { CotizaTrasladosComponent } from './traslados/traslados.component';
import { CotizaVcmComponent } from './vcm/vcm.component';
import { RsvCreateDialog } from './modals/create-rsv';

import { OrderModule } from 'ngx-order-pipe';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatStepperModule } from '@angular/material/stepper';
import { HotelCheckoutComponent } from './modals/hotel-checkout/hotel-checkout.component';
import { SendQuoteComponent } from './modals/send-quote/send-quote.component';
import { XferCheckoutComponent } from './modals/xfer-checkout/xfer-checkout.component';
import { ValidateTicketComponent } from './modals/validate-ticket/validate-ticket.component';
import { TourCheckoutComponent } from './modals/tour-checkout/tour-checkout.component';



@NgModule({ 
  declarations: [
    CotizadorComponent,
    CotizaHotelComponent, RemoveInsuranceDialog,
    CotizaVcmComponent,
    CotizaToursComponent,
    CotizaTrasladosComponent,
    CotizaConciertosComponent,
    RsvCreateDialog,
    HotelCheckoutComponent,
    XferCheckoutComponent,
    TourCheckoutComponent,
    SendQuoteComponent,
    ValidateTicketComponent,
  ],
  exports: [
    CotizadorComponent,
    CotizaHotelComponent, RemoveInsuranceDialog,
    CotizaVcmComponent,
    CotizaToursComponent,
    CotizaTrasladosComponent,
    CotizaConciertosComponent,
    RsvCreateDialog,
    HotelCheckoutComponent,
    XferCheckoutComponent,
    TourCheckoutComponent,
    SendQuoteComponent,
    ValidateTicketComponent,
  ],
  imports: [    
    OrderModule,
    SharedModule,
    
    MatSliderModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
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
    MatCheckboxModule,
    MatChipsModule,
    MatRadioModule,
    MatDialogModule,
    MatMenuModule,
    MatStepperModule,
    
  ]
})
export class CotizadorModule { }
