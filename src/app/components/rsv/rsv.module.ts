import { NgModule } from '@angular/core';
import { OrderModule } from 'ngx-order-pipe';
import { SharedModule } from 'src/app/shared/shared.module';
import { RsvComponent } from './rsv.component';



@NgModule({
  declarations: [
    RsvComponent
  ],
  exports: [
    RsvComponent
  ],
  imports: [
    OrderModule,
    SharedModule,
  ]
})
export class RsvModule { }
