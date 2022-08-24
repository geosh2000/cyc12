import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { reverse } from 'dns';
import * as moment from 'moment';
import { OrderPipe } from 'ngx-order-pipe';
import { ApiService, ComercialService, InitService } from 'src/app/services/service.index';
import Swal from 'sweetalert2';

class userOps {
  Bodas: []
  Grupos: []
}

@Component({
  selector: 'app-listado',
  templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.css'],
  providers: [ userOps ]
})
export class ListadoComponent implements OnInit {

  @ViewChild( MatPaginator ) paginator: MatPaginator;
  @ViewChild( MatSort ) sort: MatSort;

  userOportunities = new userOps

  // Table
  displayColumns = []
  dataSource = new MatTableDataSource([])

  constructor(public _api: ApiService, 
              public _init: InitService, 
              public _com: ComercialService,
              public dialog: MatDialog,
              private fb: UntypedFormBuilder,
              private sanitization:DomSanitizer,
              private router:Router,
              private order: OrderPipe) { 

      // TABLE COLUMNS
      this.displayColumns = [
        'tipo',
        'Hotel_evento__c',
        'Name',
        'inicio',
        'Observaciones__c',
        'StageName',
        'Acciones'
      ]

    moment.locale('es-mx');

  }

  ngOnInit(): void {
    this.getUserOportunities()
  }

  getUserOportunities(){

    this._api.restfulPost( '', 'Sf/searchUserOportunities' )
                .subscribe( res => {

                  this.userOportunities = res['data']

                  let ops = []

                  for( let t in this.userOportunities ){
                    let g = this.userOportunities[t]
                    for( let op of g ){
                      op['tipo'] = t
                      op['inicioTxt'] = moment(op['Fecha_inicio_estancia__c'] == null ? op['OA_Fecha_Boda__c'] : op['Fecha_inicio_estancia__c']).format('YYYYMMDD')
                      op['inicio'] = moment(op['Fecha_inicio_estancia__c'] == null ? op['OA_Fecha_Boda__c'] : op['Fecha_inicio_estancia__c']).format('YYYY-MM-DD')
                      ops.push( op )
                    }
                  }

                  ops = this.order.transform(ops, 'inicio', true)

                  this.dataSource = new MatTableDataSource( ops )
                  this.dataSource.paginator = this.paginator;
                  this.dataSource.sort = this.sort;

                  console.log(ops)
                  console.log(this.dataSource)

                }, err => {
                  this.userOportunities = new userOps
                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  searchById( id ){

    Swal.fire({
      title: '<strong>Obteniendo detalles de la oportunidad</strong>',
      icon: 'info',
      text: 'Espera un momento',
      showCloseButton: false,
      showCancelButton: false,
      showConfirmButton: false
    })

    Swal.showLoading()

    this._api.restfulPost( { opportunityId: id }, 'Sf/searchOportunity' )
                .subscribe( res => {

                  if( res['data'].length == 0 ){

                    Swal.fire({
                      title: '<strong>Sin Resultados</strong>',
                      icon: 'warning',
                      text: 'No se encontró la oportunidad seleccionada. Verifica con tu supervisor',
                      showCloseButton: false,
                      showCancelButton: false,
                      showConfirmButton: true,
                      focusConfirm: true
                    })

                    return
                  }

                  console.log( res )
                  // this.createOpEditForm( res['data'] )
                  this.router.navigateByUrl('/grupos/cotizar', { state: res['data'] });
                  Swal.close()

                }, err => {
                  
                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });
  }

}
