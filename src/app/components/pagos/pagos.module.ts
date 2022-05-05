import { NgModule } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SharedModule } from 'src/app/shared/shared.module';

import { PagosComponent } from './pagos.component';
import { LinkGeneratorComponent } from './link-generator/link-generator.component';
import { LinkReportComponent } from './link-report/link-report.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PagosRegistroComponent } from './pagos-registro/pagos-registro.component';
import { ComponentsSharedModule } from '../shared/components-shared.module';
import { AplicacionPagosCieloComponent } from './aplicacion-pagos-cielo/aplicacion-pagos-cielo.component';


@NgModule({ 
  declarations: [
    PagosComponent,
    LinkGeneratorComponent,
    LinkReportComponent,
    PagosRegistroComponent,
    AplicacionPagosCieloComponent,
  ],
  exports: [
    PagosComponent,
    LinkGeneratorComponent,
    LinkReportComponent,
    PagosRegistroComponent,
    AplicacionPagosCieloComponent,
  ],
  imports: [    

    SharedModule,
    ComponentsSharedModule,

    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatSortModule,
    MatTooltipModule,
  ]
})
export class PagosModule { }
