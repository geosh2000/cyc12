import { NgModule } from '@angular/core';

import { OrderModule } from 'ngx-order-pipe';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReportingComponent } from './reporting.component';
import { ConfirmacionesPendientesComponent } from './confirmaciones-pendientes/confirmaciones-pendientes.component';
import { ReportingDirective } from './reporting.directive';
import { SegurosPendientesCapturaComponent } from './seguros-pendientes-captura/seguros-pendientes-captura.component';
import { BlankReportComponent } from './blank-report/blank-report.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ExportarAvalonComponent } from './exportar-avalon/exportar-avalon.component';
import { RsvListComponent } from './rsv-list/rsv-list.component';
import { PagosPendientesComponent } from './pagos-pendientes/pagos-pendientes.component';



@NgModule({ 
  declarations: [
    ReportingDirective,

    BlankReportComponent,
    ReportingComponent,
    ConfirmacionesPendientesComponent,
    SegurosPendientesCapturaComponent,
    ExportarAvalonComponent,
    RsvListComponent,
    PagosPendientesComponent,
  ],
  exports: [
    ReportingDirective,

    BlankReportComponent,
    ReportingComponent,
    ConfirmacionesPendientesComponent,
    SegurosPendientesCapturaComponent,
    ExportarAvalonComponent,
    RsvListComponent,
    PagosPendientesComponent,
  ],
  imports: [    
    OrderModule,
    SharedModule,
    
    MatSliderModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatGridListModule,
    MatCardModule,
    MatExpansionModule,
    MatDividerModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    MatMomentDateModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatChipsModule,
    MatRadioModule,
    MatDialogModule,
    MatMenuModule,
    MatStepperModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    
  ]
})
export class ReportingModule { }
