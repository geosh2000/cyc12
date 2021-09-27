import { NgModule } from '@angular/core';

import { CotizaConciertosComponent } from './conciertos/conciertos.component';
import { CotizadorComponent } from './cotizador.component';
import { CotizaHotelComponent, RemoveInsuranceDialog } from './hotel/hotel.component';
import { CotizaToursComponent } from './tours/tours.component';
import { CotizaTrasladosComponent } from './traslados/traslados.component';
import { CotizaVcmComponent } from './vcm/vcm.component';

import { OrderModule } from 'ngx-order-pipe';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({ 
  declarations: [
    CotizadorComponent,
    CotizaHotelComponent, RemoveInsuranceDialog,
    CotizaVcmComponent,
    CotizaToursComponent,
    CotizaTrasladosComponent,
    CotizaConciertosComponent,
  ],
  exports: [
    CotizadorComponent,
    CotizaHotelComponent, RemoveInsuranceDialog,
    CotizaVcmComponent,
    CotizaToursComponent,
    CotizaTrasladosComponent,
    CotizaConciertosComponent,
  ],
  imports: [    
    OrderModule,
    SharedModule
  ]
})
export class CotizadorModule { }
