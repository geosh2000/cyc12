import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DoPaymentComponent } from './do-payment/do-payment.component';


const childRoutes: Routes = [
    { 
      path: '', 
      children: [
          { path: 'doPayment/:ref/:id', component: DoPaymentComponent , data: { title: 'Realizar Pago' }},
      ]
  },
]



@NgModule({
  imports: [RouterModule.forChild(childRoutes)],
  exports: [RouterModule]
})
export class ChildRoutesModule { }
