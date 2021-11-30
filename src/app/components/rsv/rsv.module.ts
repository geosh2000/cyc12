import { NgModule } from '@angular/core';
import { OrderModule } from 'ngx-order-pipe';
import { SharedModule } from 'src/app/shared/shared.module';
import { GenerateAuthFileComponent } from './generate-auth-file/generate-auth-file.component';
import { RsvComponent } from './rsv.component';



@NgModule({
  declarations: [
    RsvComponent,
    GenerateAuthFileComponent,
  ],
  exports: [
    RsvComponent,
    GenerateAuthFileComponent,
  ],
  imports: [
    OrderModule,
    SharedModule,
  ]
})
export class RsvModule { }
