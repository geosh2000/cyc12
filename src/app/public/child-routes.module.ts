import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DoPaymentComponent } from './do-payment/do-payment.component';
import { VoucherReviewComponent } from './voucher-review/voucher-review.component';


const childRoutes: Routes = [
    { 
      path: '', 
      children: [
          { path: 'doPayment/:ref/:id', component: DoPaymentComponent , data: { title: 'Realizar Pago' }},
          { path: 'getVouchers', component: VoucherReviewComponent , data: { title: 'Obtener Vouchers' }},
          { path: 'getVouchers/:conf', component: VoucherReviewComponent , data: { title: 'Obtener Vouchers' }},
      ]
  },
]



@NgModule({
  imports: [RouterModule.forChild(childRoutes)],
  exports: [RouterModule]
})
export class ChildRoutesModule { }
