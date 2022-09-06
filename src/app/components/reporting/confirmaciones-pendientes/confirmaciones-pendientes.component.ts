import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { ApiService, AvalonService, HelpersService, InitService, WebSocketService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';
import 'moment/locale/es-mx';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-confirmaciones-pendientes',
  templateUrl: './confirmaciones-pendientes.component.html',
  styleUrls: ['./confirmaciones-pendientes.component.css']
})
export class ConfirmacionesPendientesComponent implements OnInit, OnDestroy {

  confListen$: Subscription;

  loading = {}
  pendientes = []
 
  constructor( 
    private _api: ApiService, 
    public _h: HelpersService, 
    public _init: InitService,
    private _ws: WebSocketService,
    private _avalon: AvalonService
    ) { 
    moment.locale('es-mx');

    this.confListen$ = this._ws.confirmation().subscribe(
      msg => {

        for( let r of this.pendientes ){
          if( r['itemLocatorId'] == msg['data']['itemId'] ){
            this.confirm(false, r, msg['data']['confirmation'], msg['data']['userConfirm'])
            return true
          }
        }

      })
  }

  ngOnInit(): void {
    this.getPending()
  }

  ngOnDestroy(): void {
      this.confListen$.unsubscribe()
  }

  getPending(){

    this.loading['pendientes'] = true

    this._api.restfulGet( '', 'Rsv/confirmacionesPendientes' )
                .subscribe( res => {

                  this.loading['pendientes'] = false;
                  
                  this.pendientes = res['data']

                }, err => {
                  this.loading['pendientes'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });

  }

  copy( e ){
    this._init.copyToClipboard( e )
  }

  dateCieloPrint( d ){
    let f = moment(d)
    return `${f.format('DD')}${f.format('MM')}${f.format('YY')}` 
  }

  rowStatus( r ){
    if( !r['confirmation'] ){
      return ''
    }

    return 'table-success'
  }

  confirm( save, r, c, u = this._init.currentUser.username ){

    if( save ){

      if( r['insurance'] ){
        if( r['insurance']['cieloCaptured'] == '0' ){
          this._init.snackbar('error', 'Debes capturar el seguro para poder ingresar la confirmacion', 'Cerrar')
          return false
        }
      }
      
      if( r['packedItems'] ){
        for( let p of r['packedItems'] ){
          if( p['cieloCaptured'] == '0' ){
            this._init.snackbar('error', 'Debes capturar el seguro empaquetado para poder ingresar la confirmacion', 'Cerrar')
            return false
          }
        }
      }

      this.sendConf( r, c, u )
    }else{
      r['confirmed'] = true
      r['confirmation'] = c
      r['userConfirm'] = u
    }

  }

  sendConf( r, conf, u ){
    
    r['loading'] = true

    this._api.restfulPut( {'itemLocatorId': r['itemLocatorId'], 'confirm': conf}, 'Rsv/saveConfirm' )
                .subscribe( res => {

                  r['loading'] = false;
                  this._init.snackbar('success', res['msg'], 'Cerrar')
                  
                  r['confirmed'] = true
                  r['confirmation'] = conf
                  r['userConfirm'] = u

                }, err => {
                  r['loading'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });
  }

  setCaptured( r ){
    
    r['insurance']['loading'] = true

    this._api.restfulPut( {'itemLocatorId': r['insurance']['itemLocatorId']}, 'Rsv/setCaptured' )
                .subscribe( res => {

                  r['insurance']['loading'] = false;
                  this._init.snackbar('success', res['msg'], 'Cerrar')
                  
                  r['insurance']['cieloCaptured'] = '1'

                }, err => {
                  r['insurance']['loading'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });
  }

  goToLoc( r ){
    let loc = r['itemLocatorId'].substr(0,6)
    window.open("https://cyc-oasishoteles.com/#/rsv2/" + loc)
  }

  avalonRegister( r ){

    let ml = r['itemlocatorid']

    Swal.fire({
      title: 'Generando XML...',
      allowOutsideClick: false,
      })
    Swal.showLoading()

    this._api.xmlGet( ml + '/xml', 'Avalon/getRsvArr' )
                .subscribe( res => {

                    this.postToAvalon( res, r )

                }, err => {

                  const error = err.error;
                  this._init.snackbar( 'error', error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  postToAvalon( xml, r ){
    Swal.fire({
      title: 'Enviando XML a Avalon...',
      allowOutsideClick: false,
      })
    Swal.showLoading()
    this._avalon.xmlPost( xml, 'postReservation' )
            .subscribe( res => {

              
              this.uploadAvalonConfirmations( res, r )

            }, err => {

              const error = err.error;
              this._init.snackbar( 'error', error.msg, err.status );
              console.error(err.statusText, error.msg);

            });
  }

  uploadAvalonConfirmations( conf, r ){

    Swal.fire({
      title: 'Guardando confirmaciones de Avalon en CYC...',
      allowOutsideClick: false,
      })
    Swal.showLoading()

    this._api.restfulPut( conf, 'Rsv/saveAvalonConfirmation' )
                .subscribe( res => {

                  Swal.close()
                  this._init.snackbar('success', 'Confirmados', res['msg'] );
                  r['confirmed'] = true
                  r['confirmation'] = 'Confirmada en AVALON'
                  r['userConfirm'] = 'sistema'

                }, err => {

                  Swal.close()
                  const error = err.error;
                  this._init.snackbar( 'error', error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

}
