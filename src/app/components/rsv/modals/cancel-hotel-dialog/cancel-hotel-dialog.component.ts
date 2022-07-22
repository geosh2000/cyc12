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

    if( f == null ){
      if( this.item['insuranceFlag'] ){
        f = true
      }
    }
    this.editPaymentDialog.close( f );
  }

  penalidadTotal( i ){
    let hotel = i['penalidad']
    let packs = 0
    let seguro = 0

    for( let p of this.item['packs'] ){
      if( p['keep'] ){ 
        packs += p['montoPagado'] > 0 ? parseFloat(p['monto']) : 0 
      }
    }

    this.item['minPenalty'] = packs 

    return hotel + packs + seguro
  }
  
  montoReembolso( i ){
    let penalty = this.penalidadTotal(i)
    let pagado = parseFloat(i['montoPagado']) + parseFloat(i['montoEnValidacion']) + parseFloat(i['sg_montoPagadoTotal']) + parseFloat(i['pkgItems']['totalValidacion']) + parseFloat(i['pkgItems']['totalPagado'])

    return pagado - penalty
  }

  packsSelected( e ){
    let selected = e.source._value
    
    let i = 0
    for( let p of this.item['packs'] ){
      p['keep'] = selected.includes(i)

      i++
    }

    console.log( this.item['packs'] )
  }

  getPolicy(){

    this._api.restfulPut( {item: this.item}, 'Rsv/getXldPolicy' )
    .subscribe( res => {

      this.xldPolicy = res['data']
      this.item['penalidad'] = parseFloat(this.xldPolicy['penalidadTotal']) > parseFloat(this.item['montoPagado']) + parseFloat(this.item['montoEnValidacion']) ? parseFloat(this.item['montoPagado']) + parseFloat(this.item['montoEnValidacion']) : parseFloat(this.xldPolicy['penalidadTotal'])

    }, err => {
      
      const error = err.error;
      this._init.snackbar('error', error.msg, err.status );
      console.error(err.statusText, error.msg);

    });
  }

  filterPkgIncl( itms ){

    
    this.item['minPenalty'] = 0

    let packs = []
    for( let i of itms ){
      console.log(i['itemPacked'], this.item['itemLocatorId'], i['sg_itemRelated'], i['isCancel'] )
      if( (i['itemPacked'] == this.item['itemLocatorId'] || i['sg_itemRelated'] == this.item['itemLocatorId']) && i['isCancel'] == 0){
        console.log(i)

        if( ( parseFloat(i['montoPagado']) + parseFloat(i['montoEnValidacion'])) != 0 ){ 
          i['keep'] = true

          this.item['minPenalty'] += i['monto']

          if( moment(i['llegada']) <= moment() ){
            i['notCancellable'] = true
          }
        }


        i['montoPagado'] = this._h.moneyFormat(i['montoPagado'])
        i['montoEnValidacion'] = this._h.moneyFormat(i['montoEnValidacion'])

        if( i['itemType'] == '10' ){
          this.item['sg_montoTotal'] = (this.item['sg_montoTotal'] ?? 0) + parseFloat(i['monto']) 
          this.item['sg_montoPagadoTotal'] = parseFloat(i['montoPagado'] ?? 0) + parseFloat(i['montoEnValidacion'] ?? 0)
        }

        packs.push(i)
      }
    }

    console.log (this.item)
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

  cancelIns( i, f ){
    if( f ){
      i['insXldLoading'] = true

      this._api.restfulPut( i, 'Rsv/xldInsV12' )
          .subscribe( res => {
            i['insXldLoading'] = false
            i['insuranceFlag'] = true

          }, err => {
            i['insXldLoading'] = false
            const error = err.error;
            this._init.snackbar('error', error.msg, err.status );
            console.error(err.statusText, error.msg);

          });
    }else{
      i['insuranceFlag'] = true
      i['insuranceKeep'] = true
    }
  }


}
