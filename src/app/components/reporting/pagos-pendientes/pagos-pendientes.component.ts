import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Moment } from 'moment';
import { ApiService, InitService } from 'src/app/services/service.index';

import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

import Swal from 'sweetalert2';
import * as moment from 'moment-timezone';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD-MM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-pagos-pendientes',
  templateUrl: './pagos-pendientes.component.html',
  styleUrls: ['./pagos-pendientes.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class PagosPendientesComponent implements OnInit {

  items = [
    { name: 'Item 1', status: 'Completed' },
    { name: 'Item 2', status: 'In Progress' },
    { name: 'Item 3', status: 'Pending' }
  ];

  date: Moment = moment()

  constructor(private http: HttpClient, private _api: ApiService, private _init: InitService) {
    // this.processNext();
  }

  ngOnInit(): void {
  }

  getList(){

    Swal.fire(
      {
        title: 'Obteniendo listado de pagos para exportar',
        showCancelButton: false,
        showConfirmButton: false,
        showCloseButton: false,
        allowEscapeKey: false,
        allowOutsideClick: false
      }
    )

    Swal.showLoading()

    this._api.restfulPut( {id:this.date.format('YYYY-MM-DD'), 'date':true}, 'Avalon/getPayments' )
                .subscribe( res => {

                  let items = []
                  for( let i of res['data'] ){
                    i['dataUploaded'] = []
                    i['status'] = 'Pending'
                    i['name'] = i['confirm']
                    items.push(i)
                  }

                  Swal.close()

                  this.items = items

                }, err => {
                  
                  Swal.close()
                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);


                });

  }

  showErrors( item ){
    /* Abrir un modal en SWAL que muestre la data de item.dataUploaded */
    let html = ''
    for( let t of item.dataUploaded ){
      html += `<div>${t['msg']}</div>`
    }

    Swal.fire({
      title: 'Errores',
      html: html,
      showCancelButton: false,
      showConfirmButton: true,
      showCloseButton: true,
      allowEscapeKey: true,
      allowOutsideClick: true
    })
  }
  
  showPayload( item ){
    /* Abrir un modal en SWAL que muestre la data de item.dataUploaded */
    let html = ''
    for( let t of item.dataUploaded ){
      html += `<pre>${JSON.stringify(t['payload'])}</pre><br>`
    }

    Swal.fire({
      title: 'Payloads',
      html: html,
      showCancelButton: false,
      showConfirmButton: true,
      showCloseButton: true,
      allowEscapeKey: true,
      allowOutsideClick: true
    })
  }

  processPayment( item, onlyOne = false ){
    item.status = 'In Progress';

    this._api.restfulPut( {id:item.itemId, 'date':false}, 'Avalon/processPayment' )
                .subscribe( res => {

                  item.dataUploaded = res['data']
                  for( let t of res['data'] ){
                    if( t['err'] ){
                      item.status = 'Error'
                    }
                  }
                  if( item.status != 'Error'){
                    item.status = 'Completed'
                  }
                  
                  if( !onlyOne ){
                    this.processNext();
                  }

                }, err => {
                  
                  item.status = 'Error'
                  Swal.close()
                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);
                  
                  if( !onlyOne ){
                    this.processNext();
                  }

                });
  }

  processNext() {
    const item = this.items.find(i => i.status === 'Pending');
    if (!item) {
      return;
    }

    this.processPayment( item )
  }

}
