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
import { UploadComplementosComponent } from './uploads/upload-complementos/upload-complementos.component';
import { UploadDesplazosComponent } from './uploads/upload-desplazos/upload-desplazos.component';
import { UploadRoibackComponent } from './uploads/upload-roiback/upload-roiback.component';



@NgModule({
  declarations: [
    UploadsComponent,
    UploadCieloComponent,
    UploadLoyaltyComponent,
    UploadComplementosComponent,
    UploadDesplazosComponent,
    UploadRoibackComponent,
  ],
  exports: [
    UploadsComponent,
    UploadCieloComponent,
    UploadLoyaltyComponent,
    UploadComplementosComponent,
    UploadDesplazosComponent,
    UploadRoibackComponent,
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
