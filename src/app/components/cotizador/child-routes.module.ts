import { NgModule } from '@angular/core';

import { CotizadorComponent } from '../cotizador/cotizador.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guard/auth.guard';
import { HotelCheckoutComponent } from './modals/hotel-checkout/hotel-checkout.component';

const childRoutes: Routes = [
  { 
    path: '', 
    component: CotizadorComponent ,
    canActivate: [ AuthGuard ],
    data: { title: 'Cotizador', role: 'app_cotizador' } 
  },
  { 
    path: 'test', 
    component: HotelCheckoutComponent ,
    canActivate: [ AuthGuard ],
    data: { title: 'Checkout - Test', role: 'app_cotizador' } 
  },
]



@NgModule({
  imports: [RouterModule.forChild(childRoutes)],
  exports: [RouterModule]
})
export class ChildRoutesModule { }
