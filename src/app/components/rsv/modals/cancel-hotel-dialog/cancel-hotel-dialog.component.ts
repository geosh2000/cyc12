import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService, HelpersService, InitService, ZonaHorariaService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cancel-hotel-dialog',
  templateUrl: './cancel-hotel-dialog.component.html',
  styleUrls: ['./cancel-hotel-dialog.component.css']
})
export class CancelHotelDialogComponent implements OnInit {

  xldPolicy = {}
  item = {}
  isToday = false

  constructor(
    public editPaymentDialog: MatDialogRef<CancelHotelDialogComponent>,
    public _api: ApiService,
    public _h: HelpersService,
    private _init: InitService,
    private _zh: ZonaHorariaService,
    @Inject(MAT_DIALOG_DATA) public data) {

    }

  ngOnInit(): void {

    this.item = this.data['item']

    this.item['packs'] = this.filterPkgIncl( this.data['all'] )

    if( this.item['isQuote'] == 1 && this.item['isConfirmable'] == 0 ){ 
      this.item['penalidad'] = 0
      this.item['xldType'] = 'traspaso'
    }

    if( moment(this.item['llegada']) >= moment() ){ this.isToday = true }
    
    if( this.item['isQuote'] == '0' && this.item['isCancel'] == '0' ){ this.getPolicy() }

     if( this.item['tipoPago'] == 'PH' ){
      this.item['xldType'] = 'traspaso'
      this.item['penalidad'] = 0
     }

     console.log( this.item )
  }

  onNoClick( f = null ): void {
    this.editPaymentDialog.close( f );
  }

  getPolicy(){

    this._api.restfulPut( {item: this.item}, 'Rsv/getXldPolicy' )
    .subscribe( res => {

      this.xldPolicy = res['data']

    }, err => {
      
      const error = err.error;
      this._init.snackbar('error', error.msg, err.status );
      console.error(err.statusText, error.msg);

    });
  }

  filterPkgIncl( itms ){

    let packs = []
    for( let i of itms ){
      if( i['itemPacked'] == this.item['itemLocatorId'] ){
        i['montoPagado'] = this._h.moneyFormat(i['montoPagado'])
        i['montoEnValidacion'] = this._h.moneyFormat(i['montoEnValidacion'])
        packs.push(i)
      }
    }

    return packs
  }

  sendCancellation(){
  
    if( this.item['penalidad'] < (this.item['xldType'] != 'reembolso' ? 0 : this.item['omit10'] ? 0 : this.xldPolicy['minimumPenalty']) ){
      this._init.snackbar('error', 'La tarifa de penalidad establecida es menor a la permitida por el sistema. Revisa las políticas y parámetros seleccionados', 'Penalidad Incorrecta')
      return false
    }

    if( this.item['penalidad'] > this.item['montoPagado'] ){
      this._init.snackbar('error', 'La tarifa de penalidad establecida es mayor al monto pagado por este item. Por favor revisa nuevamente el monto de penalidad', 'Penalidad Incorrecta')
      return false
    }

    let params = {data: this.item, policies: this.xldPolicy, flag: (this.item['isQuote'] == 1 && this.item['isConfirmable'] == 0)}

    this._api.restfulPut( params, 'Rsv/cancelItemV2' )
                .subscribe( res => {

                  this._init.snackbar('success', res['msg'], 'Cancelado' );
                  this.editPaymentDialog.close( true );

                }, err => {

                  const error = err.error;
                  this._init.snackbar('error', error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });

  }

}
