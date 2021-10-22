import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadsComponent } from './uploads/uploads.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { UploadCieloComponent } from './uploads/upload-cielo/upload-cielo.component';
import { UploadLoyaltyComponent } from './uploads/upload-loyalty/upload-loyalty.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';



@NgModule({
  declarations: [
    UploadsComponent,
    UploadCieloComponent,
    UploadLoyaltyComponent,
  ],
  exports: [
    UploadsComponent,
    UploadCieloComponent,
    UploadLoyaltyComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,

    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressBarModule,
  ]
})
export class ConfigModule { }
