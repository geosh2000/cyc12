import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoPaymentComponent } from './do-payment/do-payment.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { DomSeguroPipe } from '../pipes/dom-seguro.pipe';
import { PublicManageModule } from './public-manage/public-manage.module';
import { SharedModule } from '../shared/shared.module';
import { VoucherReviewComponent } from './voucher-review/voucher-review.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@NgModule({
  declarations: [
    DoPaymentComponent,
    DomSeguroPipe,
    VoucherReviewComponent,
  ],
  exports: [
    DoPaymentComponent,
    VoucherReviewComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,

    PublicManageModule,

    MatCardModule, 
    MatProgressBarModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
  ] 
})
export class PublicModule { }
