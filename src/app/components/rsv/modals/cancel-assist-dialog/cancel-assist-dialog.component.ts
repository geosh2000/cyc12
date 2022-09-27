import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService, HelpersService, InitService, ZonaHorariaService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cancel-assist-dialog',
  templateUrl: './cancel-assist-dialog.component.html',
  styleUrls: ['./cancel-assist-dialog.component.css']
})
export class CancelAssistDialogComponent implements OnInit {

  xldPolicy = {}
  item = {}
  isToday = false
  keep = false
  
  constructor(
    public cancelAssisDialog: MatDialogRef<CancelAssistDialogComponent>,
    public _api: ApiService,
    public _h: HelpersService,
    private _init: InitService,
    private _zh: ZonaHorariaService,
    @Inject(MAT_DIALOG_DATA) public data) {

    }

  ngOnInit(): void {

    this.item = this.data['item']

    if( this.item['isQuote'] == 1 && this.item['isConfirmable'] == 0 ){ 
      this.item['penalidad'] = 0
      this.item['xldType'] = 'traspaso'
    }

    if( moment(this.item['llegada']) > moment() ){ 
      this.isToday = true 
    }

    this.item['keep'] = false

     if( this.item['tipoPago'] == 'PH' ){
      this.item['xldType'] = 'traspaso'
      this.item['penalidad'] = 0
     }

     this.item['montoPagado'] = this._h.moneyFormat(this.item['montoPagado'])
     this.item['montoEnValidacion'] = this._h.moneyFormat(this.item['montoEnValidacion'])

     console.log( this.item )

     if( moment(this.item['llegada']) <= moment(moment().format('YYYY-MM-DD')) && this.item['confirmOK'] != null){
      Swal.fire('¡No Cancelable!', 'El seguro seleccionado tiene una fecha menor o igual a la actual, por lo que no es apto para ser cancelado. Verifica con gerencia', 'error')
      this.onNoClick()
     }else{
        this.item['keep'] = false
        this.packsSelected()
     }
  }

  onNoClick( f = null ): void {
    this.cancelAssisDialog.close( f );
  }

  penalidadTotal( i = {} ){
    let packs = 0
    let seguro = 0

      if( this.item['keep'] ){ 
        packs += this.item['montoPagado'] > 0 ? parseFloat(this.item['monto']) : 0 
      }


    this.item['minPenalty'] = packs 

    return packs + seguro
  }
  
  montoReembolso( i ){
    let penalty = this.penalidadTotal(i)
    let pagado = parseFloat(i['montoPagado']) + parseFloat(i['montoEnValidacion'])

    return pagado - penalty
  }

  packsSelected( e = [1] ){
    let selected = e
    
    let i = 0

    this.item['keep'] = selected.includes(0)

    console.log( this.item )
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
    this.item['sg_montoTotal'] = 0
    this.item['sg_montoPagadoTotal'] = 0

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
  
    let params = {data: this.item}

    this._api.restfulPut( params, 'Rsv/cancelAssistItemV2' )
                .subscribe( res => {

                  this._init.snackbar('success', res['msg'], 'Cancelado' );
                  this.cancelAssisDialog.close( true );

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
