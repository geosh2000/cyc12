import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { ReportingDirective } from './reporting.directive';
import { ReportComponent } from './report.component';
import { ReportingItem } from './reporting-item';
import { BlankReportComponent } from './blank-report/blank-report.component';
import { ConfirmacionesPendientesComponent } from './confirmaciones-pendientes/confirmaciones-pendientes.component';
import { SegurosPendientesCapturaComponent } from './seguros-pendientes-captura/seguros-pendientes-captura.component';


@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.css']
})
export class ReportingComponent implements OnInit, OnDestroy {

  @ViewChild(ReportingDirective, {static: true}) adHost!: ReportingDirective;
  reportUrl$: Subscription;
  
  reports: ReportingItem;

  reportParams = { show: false }

  loading = {}

  constructor( private activatedroute:ActivatedRoute ){
  }

  ngOnInit(): void {   
    this.reportUrl$ = this.activatedroute.data.subscribe(data => {

      if( data.reporte ){
        this.loadComponent( data.reporte );
      }else{
        this.loadComponent( 'blank' );
      }
    })
  }

  ngOnDestroy() {
    this.reportUrl$.unsubscribe()
  }

  loadReport( rep ){

    switch( rep ){
      case 'confPendientes':
        this.reports = new ReportingItem(
          ConfirmacionesPendientesComponent,
          { show: true, title: 'Confirmaciones Pendientes de Captura', bio: 'Brave as they come' }
        )
        break
      case 'segurosPendientes':
        this.reports = new ReportingItem(
          SegurosPendientesCapturaComponent,
          { show: true, title: 'Seguros Pendientes de Captura', bio: 'Brave as they come' }
        )
        break
      default:
        this.reports = new ReportingItem(
          BlankReportComponent,
          { show: false }
        )
        break;
    }
  }

  loadComponent( r ) {

      this.loadReport( r )

      const viewContainerRef = this.adHost.viewContainerRef;
      viewContainerRef.clear();

      const componentRef = viewContainerRef.createComponent<ReportComponent>(this.reports.component);
      this.reportParams = this.reports.data;
  }

}
