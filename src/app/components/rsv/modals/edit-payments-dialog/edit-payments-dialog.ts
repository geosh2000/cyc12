import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService, HelpersService, InitService, ZonaHorariaService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';
import Swal from 'sweetalert2';


@Component({
      selector: 'edit-payments-dialog',
      templateUrl: './edit-payments-dialog.html',
      styleUrls: ['../../components/main-frame/main-frame.component.css']
  })
  export class EditPaymentDialog implements OnInit {

    loading = {}
    items = []
    xldItems = []

    chgMade = false

    constructor(
      public editPaymentDialog: MatDialogRef<EditPaymentDialog>,
      public _api: ApiService,
      public _h: HelpersService,
      private _init: InitService,
      private _zh: ZonaHorariaService,
      @Inject(MAT_DIALOG_DATA) public data) {

      }

    ngOnInit(): void {
      this.filterItems()
    }
  
    onNoClick( f = null ): void {
      this.editPaymentDialog.close( f );
    }

    filterItems(){
      let items = []
      let xldItems = []

      for( let i of this.data['items'] ){
        if( i['isCancel'] == 0 && i['editablePrepay'] == 1 ){
          items.push( i )
        }
        
        if( i['isCancel'] == 1 && this._h.moneyCents(i['montoPenalidad']) > 0 && i ['itemType'] == 1 ){
          xldItems.push( i )
        }
      }

      if( items.length == 0 && xldItems.length == 0  ){
        Swal.fire('Sin Resultados', 'No existen items que permitan editar los prepagos / totales', 'info')
        this.editPaymentDialog.close( false );
      }

      this.items = items
      this.xldItems = xldItems
    }

    editOneNight( x ){
      this.items[x]['montoParcialEdit'] = this.oneNight(x)
    }

    oneNight(x){
      return this._h.moneyInts( (this._h.moneyCents(this.items[x]['monto']) + this._h.moneyCents(this.items[x]['pkgItems']['totalValue'])) / this.items[x]['htlNoches'] - this._h.moneyCents(this.items[x]['pkgItems']['totalValue']))
    }

    editParcial( x, xld = false ){

      if( xld ){
        this.xldItems[x]['editFlag'] = true
        this.xldItems[x]['montoParcialEdit'] = this.xldItems[x]['montoParcial']
        this.xldItems[x]['prepagoIsTraspaso'] = true
      }else{
        this.items[x]['editFlag'] = true
        this.items[x]['montoParcialEdit'] = this.items[x]['montoParcial']
        this.items[x]['prepagoIsTraspaso'] = true
      }     
    }

    editTotal(x){
      this.items[x]['editTotalFlag'] = true
      this.items[x]['montoTotalEdit'] = this.items[x]['monto']
      this.items[x]['prepagoIsTraspaso'] = true
      this.items[x]['editTotalComments'] = ''
    }

    editMontoPrepago( i, x, xld = false ){

      i['loadingEdit'] = true

      if( i['isNR'] == '1' && !this._init.checkSingleCredential('rsv_cancelAll') && moment().format('YYYY-MM-DD') != moment(i['llegada']).format('YYYY-MM-DD') ){
        this._init.snackbar( 'error', 'No es posible modificar el monto a prepagar de una reserva "No Reembolsable". El prepago debe hacerse al 100%', 'ERROR!')
        i['loadingEdit'] = false;
        return false
      }
  
      if( i['itemType'] != '1' && !this._init.checkSingleCredential('allmighty') ){
        this._init.snackbar( 'error', 'Este servicio no permite realizar un pago parcial. El prepago debe hacerse al 100%', 'ERROR!')
        i['loadingEdit'] = false;
        return false
      }
  
      let params = {
        original: i,
        new: {
          montoParcial: i['montoParcialEdit']
        },
        itemId: i['itemId'],
        xld
      }
  
      if( this._h.moneyCents(params['new']['montoParcial']) < this._h.moneyCents(i['montoPagado']) ){
        
        // Ajuste permitido solo a administrador
        if( this._init.checkSingleCredential('allmighty')){
          
          params['isR'] =  !i['prepagoIsTraspaso']
  
        }else{
                this._init.snackbar('error', 'El monto pagado es mayor al monto total indicado. Esta operación sólo puede realizarla Gerencia', 'Error!')
                i['loadingEdit'] = false;
                return false
        }
      }
  
      

      this._api.restfulPut( params, 'Rsv/editMontoParcial' )
                  .subscribe( res => {

                    i['loadingEdit'] = false;
                    i['montoParcialOriginal'] = i['montoParcial']
                    i['montoParcial'] = params['new']['montoParcial']

                    if( xld ){
                      this.xldItems[x] = res['data']
  
                      this.xldItems[x]['editFlag'] = false
                    }else{
                      this.items[x] = res['data']
  
                      this.items[x]['editFlag'] = false
                    }

                    
                    this._init.snackbar('success', 'Prepago modificado correctamente', 'Guardado')
                    this.chgMade = true

                  }, err => {
                    i['loadingEdit'] = false;

                    const error = err.error;
                    this._init.snackbar('error', error.msg, err.status );
                    console.error(err.statusText, error.msg);

                  });

    }

    editTotalMonto( i, x ){

      i['editTotalMontoLoading'] = true

      let params = {
        original: i,
        newMonto: i['montoTotalEdit'],
        comment: i['editTotalComments']
      }
  
      if( this._h.moneyCents(params['newMonto']) < this._h.moneyCents(i['montoPagado']) ){
        
        // Ajuste permitido solo a administrador
        if( this._init.checkSingleCredential('allmighty')){
          params['isR'] =  !i['prepagoIsTraspaso']
        }else{
                this._init.snackbar('error', 'El monto pagado es mayor al monto total indicado. Esta operación sólo puede realizarla gerencia', 'Error!')
                i['editTotalMontoLoading'] = false;
                return false
        }
      }
  
      this._api.restfulPut( params, 'Rsv/editMontoTotal' )
                  .subscribe( res => {
  
                    i['editTotalMontoLoading'] = false;
                    
                    this.items[x] = res['item']

                    this.items[x]['editTotalFlag'] = false
                    this._init.snackbar('success', 'Prepago modificado correctamente', 'Guardado')
                    this.chgMade = true
  
                  }, err => {
                    i['editTotalMontoLoading'] = false;
                    
                    const error = err.error;
                    this._init.snackbar('error', error.msg, err.status );
                    console.error(err.statusText, error.msg);
                    return false
  
                  });
    }

    test(p){
      console.log(p)
    }

    
}
  