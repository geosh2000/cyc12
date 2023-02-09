import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment-timezone';
import { ApiService, AvalonService, GlobalServicesService, HelpersService, InitService, ZonaHorariaService } from 'src/app/services/service.index';
import Swal from 'sweetalert2';
import { CancelAssistDialogComponent } from '../../modals/cancel-assist-dialog/cancel-assist-dialog.component';
import { CancelHotelDialogComponent } from '../../modals/cancel-hotel-dialog/cancel-hotel-dialog.component';
import { ShowItemPaymentsDialog } from '../../modals/show-item-payments-dialog/show-item-payments-dialog';

@Component({
  selector: 'app-item-sum',
  templateUrl: './item-sum.component.html',
  styleUrls: ['../main-frame/main-frame.component.css']
})
export class ItemSumComponent implements OnInit {

  @Input() hideInsXld
  @Input() data = {}
  @Output() reload = new EventEmitter
  @Output() reloadHistory = new EventEmitter
  @Output() avalon = new EventEmitter

  loading = {}

  constructor( 
    private _zh: ZonaHorariaService,
    public _init: InitService,
    public _api: ApiService,
    public _h: HelpersService,
    public dialog: MatDialog,
    public _avalon: AvalonService,
    public _global: GlobalServicesService
    ) { }

  ngOnInit(): void {
  }

  cancelItem( d ){
    console.log( d )
    switch( d['itemType'] ){
      case '1':
        this.cancelHotel(d)
        break
      case '15':
        this.cancelAssist(d)
        break
      default:
        return false
    }
  }

  // **************************** VALIDADORES INICIO ****************************

  
  // **************************** VALIDADORES FIN ****************************


  // **************************** APIS INICIO ****************************

    
    checkAvalon( l, loc = true, conf = null ){

      Swal.fire({
        title: 'Obteniendo información de este item en Avalon...',
        allowOutsideClick: false,
        })
      Swal.showLoading()

      let params = {
        "Hotel": this._global.avalonMap.hoteles[ l['hotel'].toLowerCase() ],
        // "Localizador": l['itemLocatorId'],
        "Localizador": loc ? l['itemLocatorId'] : conf,
        "NoFiltrarEstado": 'true' 
      }

      this._avalon.restfulGet( params, 'getReservation' )
                  .subscribe( async res => {

                    if( loc && res['LSReserva'][0]['EntidadNegocio'].substr(0,3) == 'CAL' && res['LSReserva'][0]['EntidadNegocio'].substr(12,2).toLowerCase() != l['moneda'].substr(0,2).toLowerCase() ){
                      console.log( 'diferente entidad' )
                      this.checkAvalon( l, false, res['LSReserva'][0]['IDReserva'] )
                      return false
                    }

                    if( res['LSReserva'].length > 0 ){

                      for( let r of res['LSReserva'][0]['LSReservaDetalle'] ){
                        if( r['Estado'] == 1 || r['Estado'] == 0 || r['Estado'] == 2 ){
                          this.updateHotelStatus( l, r['Estado'], r )
                          if( !loc && l['confirmOK'] != conf ){
                            await this.apiConfirm( l, res['LSReserva'][0]['IDReserva'])
                          }
                          return
                        }
                      }
                      
                      if( !loc && l['confirmOK'] != conf ){
                        await this.apiConfirm( l, res['LSReserva'][0]['IDReserva'])
                      }

                      this.updateHotelStatus( l, res['LSReserva'][0]['LSReservaDetalle'][0]['Estado'], res['LSReserva'][0]['LSReservaDetalle'][0] )

                    }else{
                      Swal.close()
                      this._init.snackbar('error', 'No se encontraron reservas en Avalon', 'Error' );
                    }

                  }, err => {

                    Swal.close()

                    const error = err.error;
                    this._init.snackbar('error', error.msg, err.status );
                    console.error(err.statusText, error.msg);

                  });
    }

    updateHotelStatus( l, s, r ){
      Swal.fire({
        title: 'Actualizando status en CYC a ' + this._avalon.globals.estados[s] + '... ',
        allowOutsideClick: false,
        })
      Swal.showLoading()

      let params = {
        "itemId": l['itemId'],
        "status": this._avalon.globals.estados_min[s]
      }

      this._api.restfulPut( params, 'Rsv/updateRsvAvalonStatus' )
                  .subscribe( res => {

                    Swal.close()
                    l['cieloStatus'] = params['status']
                    Swal.fire(
                      {
                        title: "Información Obtenida de " + l['itemLocatorId'],
                        html: `<pre>${ JSON.stringify(r) }</pre>
                              <br><br>Estado: ${ this._avalon.globals.estados[s]}`,
                        showConfirmButton: false,
                        showCancelButton: false,
                        showCloseButton: true
                      }
                    )

                  }, err => {

                    Swal.close()

                    const error = err.error;
                    this._init.snackbar('error', error.msg, err.status );
                    console.error(err.statusText, error.msg);

                  });
    }
  
    manualInsEmit( i ){
      this.loading['manualEmit'] = true

      this._api.restfulPut( { localizador: i }, 'Rsv/manualAssistEmit' )
                  .subscribe( res => {

                    this.loading['manualEmit'] = false;
                    this._init.snackbar('success', 'Reserva actualizada', 'Correcto' );
                    this.reload.emit( this.data['master']['masterlocatorid'] )
                  }, err => {
                    this.loading['manualEmit'] = false;

                    const error = err.error;
                    this._init.snackbar('error', error.msg, err.status );
                    console.error(err.statusText, error.msg);

                  });
    }

    setPHLoading( i ){

      return new Promise ( async resolve => {
        Swal.fire({
          title: `<strong>Fusionando Usuarios</strong>`,
          focusConfirm: false,
          showCancelButton: false,
          confirmButtonText: 'Confirmar Fusión',
          cancelButtonText: 'Cancelar'
        })
    
        Swal.showLoading()
    
        resolve( await  this.setPHApi(i) )
      })
    }

    setPackage(i){

      this._api.restfulPut( { itemId: i['itemId'] }, 'Rsv/package' )
                  .subscribe( res => {
  
                    
                    this.reload.emit( this.data['master']['masterlocatorid'] )

                    
                  }, err => {
                    this.loading['setPH'] = false;
                    
                    const error = err.error;
                    this._init.snackbar( 'error', error.msg, err.status );
                    console.error(err.statusText, error.msg);
  
                  });

    }

    addACPack(i){

      let route = i['addACPack'] == 1 ? 'addACPack' : 'addACPack50'

      this._api.restfulPut( { itemId: i['itemId'] }, 'Rsv/' + route )
                  .subscribe( res => {
  
                    
                    this.reload.emit( this.data['master']['masterlocatorid'] )

                    
                  }, err => {
                    this.loading['setPH'] = false;
                    
                    const error = err.error;
                    this._init.snackbar( 'error', error.msg, err.status );
                    console.error(err.statusText, error.msg);
  
                  });

    }

    setPHApi(i){

      return new Promise ( async resolve => {

        this.loading['setPH'] = true
  
      let params = {
        original: i,
        new: {
          montoParcial: 0
        },
        itemId: i['itemId']
      }
  
      this._api.restfulPut( params, 'Rsv/editMontoParcial' )
                  .subscribe( res => {
  
                    this.loading['setPH'] = false;
                    i['montoParcialOriginal'] = i['montoParcial']
                    i['montoParcial'] = params['new']['montoParcial']
  
                    if( res['val'] && res['val'][2] ){
                      res['data']['reload'] = res['val'][2]
                    }else{
                      res['data']['reload'] = false
                    }

                    this._init.snackbar( 'success', res['msg'], 'Guardado' );
                    this.reload.emit( this.data['master']['masterlocatorid'] )
                    resolve( true )
                    
                    
                  }, err => {
                    this.loading['setPH'] = false;
                    
                    const error = err.error;
                    this._init.snackbar( 'error', error.msg, err.status );
                    console.error(err.statusText, error.msg);
                    resolve( false )
  
                  });

      })
    }

    setORCort( i ){
  
      Swal.fire({
        title: 'Cortesia ORewards',
        text: 'Deseas establecer el item ' + i['itemLocatorId'] + 'como Cortesia ORewards?',
        showCancelButton: true,
        confirmButtonText: "Confirmar Cortesia OR",
        icon: 'question'
      }).then( async (result) => {
        if (result.isConfirmed) {
          
          Swal.fire({
            title: `<strong>Consultando ORewards Status</strong>`,
            focusConfirm: false,
            showCancelButton: false,
            showConfirmButton: false
          })
      
          Swal.showLoading()
      
          this.loading['setPH'] = true

          this._api.restfulPut( {'data': i}, 'Rsv/getCortData' )
                      .subscribe( res => {
      
                        Swal.close()
                        if( res['data']['nombre_del_nivel'].toLowerCase() != 'silver' ){
                          let noches = res['data']['noches_gratis_disfrutadas'] == null ? 0 : parseInt(res['data']['noches_gratis_disfrutadas'])
                          let free = 0
                          switch( res['data']['nombre_del_nivel'].toLowerCase() ){
                            case 'gold':
                              free = 1;
                              break;
                            case 'platinum':
                              free = 2
                              break
                          }

                          if( noches < free && parseInt(i['htlNoches']) <= free - noches ){
                            this.setPH(i, parseInt(i['htlNoches']))
                            return true
                          }
                          Swal.fire('Usuario no valido','El cliente ingresado no cuenta con noches gratis. Noches usadas: ' + noches + ' // Noches por nivel:  ' + free,'error')
                        }

                        Swal.fire('Usuario no valido','El cliente ingresado es Silver y no cuenta con noches gratis','error')
                        
                        
                      }, err => {
                        this.loading['setPH'] = false;
                        
                        const error = err.error;
                        this._init.snackbar( 'error', error.msg, err.status );
                        console.error(err.statusText, error.msg);
                        Swal.close()
                      });
        }
      })

    }
  
    setPH( i, freents = 0 ){

      let params = {
        original: i,
        new: {
          montoParcial: 0
        },
        itemId: i['itemId'],
        freents
      }
  
      Swal.fire({
        title: 'Pago en hotel',
        text: 'Deseas establecer el item ' + i['itemLocatorId'] + 'como Pago en Hotel?',
        showCancelButton: true,
        confirmButtonText: "Establecer PH",
        icon: 'question'
      }).then( async (result) => {
        if (result.isConfirmed) {
          
          Swal.fire({
            title: `<strong>Estableciendo como PH</strong>`,
            focusConfirm: false,
            showCancelButton: false,
            showConfirmButton: false
          })
      
          Swal.showLoading()
      
          this.loading['setPH'] = true

          this._api.restfulPut( params, 'Rsv/editMontoParcial' )
                      .subscribe( res => {
      
                        this.loading['setPH'] = false;
                        i['montoParcialOriginal'] = i['montoParcial']
                        i['montoParcial'] = params['new']['montoParcial']
      
                        if( res['val'] && res['val'][2] ){
                          res['data']['reload'] = res['val'][2]
                        }else{
                          res['data']['reload'] = false
                        }

                        this._init.snackbar( 'success', res['msg'], 'Guardado' );
                        this.reload.emit( this.data['master']['masterlocatorid'] )
                        Swal.close()
                        
                        
                      }, err => {
                        this.loading['setPH'] = false;
                        
                        const error = err.error;
                        this._init.snackbar( 'error', error.msg, err.status );
                        console.error(err.statusText, error.msg);
                        Swal.close()
                      });
        }
      })

    }

    editNotes( i, notes ){
      i['noteEditFlagLoad'] = true

      this._api.restfulPut( { itemId: i['itemId'], notes, og: i['notas'] }, 'Rsv/changeNotes' )
                      .subscribe( res => {
      
                        i['notas'] = notes
                        i['noteEditFlag'] = false
                        i['noteEditFlagLoad'] = false
                        this.reloadHistory.emit( true )
                        
                        
                      }, err => {
                        
                        i['noteEditFlag'] = false
                        i['noteEditFlagLoad'] = false
                        const error = err.error;
                        this._init.snackbar( 'error', error.msg, err.status );
                        console.error(err.statusText, error.msg);
                        Swal.close()
                      });
    }
  
    setNR( i, f ){
      this.loading['setNR'] = true

      this._api.restfulPut( { itemId: i['itemId'], set: f }, 'Rsv/setNR' )
                  .subscribe( res => {

                    this.loading['setNR'] = false;
                    i['isNR'] = f ? 1 : 0
                    this._init.snackbar('success', 'Reserva actualizada', 'Correcto' );
                    this.reloadHistory.emit( true )
                  }, err => {
                    this.loading['setNR'] = false;

                    const error = err.error;
                    this._init.snackbar('error', error.msg, err.status );
                    console.error(err.statusText, error.msg);

                  });
    }

    setRounded( i ){
      this._api.restfulPut( { itemId: i['itemId'] }, 'Rsv/editMontoRound' )
                      .subscribe( res => {
      
                        this.reload.emit( this.data['master']['masterlocatorid'] )
                      
                        
                      }, err => {
                        
                        const error = err.error;
                        this._init.snackbar( 'error', error.msg, err.status );
                        console.error(err.statusText, error.msg);
                        Swal.close()
                      });
    }

    resetConfirm( f , i = {} ){
      if( !f ){

        Swal.fire({
          title: "Eliminar confirmación de " + i['itemLocatorId'],
          html: `Realmente deseas eliminar la confirmación <b> ${ i['confirmOK'] }</b><br>del item <b>${ i['itemLocatorId'] }</b>?`,
          icon: 'question',
          showCancelButton: true,
          showConfirmButton: true,
          confirmButtonText: 'Resetear',
          cancelButtonText: 'Cancelar',
          allowOutsideClick: false,
          allowEscapeKey: true
        }).then( async (result) => {
          if (result.isConfirmed) {

            Swal.fire({
              title: `<strong>Reseteando confirmación</strong>`,

            })
        
            Swal.showLoading()

            let res = await this.resetConfirm( true, i ) 

            Swal.close()
            if( !res ){
              this.resetConfirm( false, i )
            }

          }
        })

        return true
      }

      return new Promise ( async resolve => {
        this.loading['reset'] = true
  
        this._api.restfulPut( { itemId: i['itemId'] }, 'Rsv/resetConfirmation' )
                    .subscribe( res => {
  
                      this.loading['reset'] = false;
                      i['confirmOK'] = null
                      i['confirm'] = null

                      this._init.snackbar('success', res['msg'], 'RESET' );
                      this.reloadHistory.emit( true )
                      resolve(true)
  
                    }, err => {
                      this.loading['reset'] = false;
  
                      const error = err.error;
                      this._init.snackbar('error', error.msg, err.status );
                      console.error(err.statusText, error.msg);
                      resolve(false)
  
                    });
      })


    }

    async confirmItem( i, c = null, f = false ){

      if( !f ){

        const { value: confirm } = await Swal.fire({
          title: "Confmirmar item " + i['itemLocatorId'],
          input: 'text',
          inputLabel: 'Confirmación',
          showCancelButton: true,
          inputValidator: (value) => {
            if (!value) {
              return 'Debes ingresar una confirmación'
            }
          }
        })

        if( confirm ){
          Swal.fire({
            title: `<strong>Guardando confirmación</strong>`,
          })
      
          Swal.showLoading()

          let res = await this.confirmItem( i, confirm, true ) 

          Swal.close()
          if( !res ){
            this.confirmItem( i )
          }
        }

        return true
      }

      return this.apiConfirm(i,c)

    }

    apiConfirm( i, c){

      return new Promise ( async resolve => {
        this.loading['confirm'] = true
    
        this._api.restfulPut( { itemLocatorId: i['itemLocatorId'], confirm: c }, 'Rsv/saveConfirm' )
                    .subscribe( res => {
    
                      this.loading['confirm'] = false;
                      i['confirmOK'] = c 
                      i['confirm'] = c 
                      this._init.snackbar( 'success', res['msg'], 'Confirmado' );
                      this.reloadHistory.emit( true )
                      resolve( true )
    
                    }, err => {
                      this.loading['confirm'] = false;
    
                      const error = err.error;
                      this._init.snackbar( 'error', error.msg, err.status );
                      console.error(err.statusText, error.msg);

                      resolve( false )
    
                    });
      })

    }

// **************************** APIS FIN ****************************


  // **************************** FORMATOS INICIO ****************************

  formatHistory( t ){
    let r = t

    r = r.replace(/[\n]/gm,'<br>')

    return r
  }

  colorConfirm( i, v = true, q = false ){
    if( !v && q){
      return 'text-danger'
    }

    switch( i ){
      case 'Cancelada':
        return 'text-danger'
      case 'Cotización':
      case 'Cotizacion':
        return 'text-warning'
      case 'Pendiente':
        return 'text-info'
      default:
        return 'text-success'
    }
  }

// **************************** FORMATOS FIN ****************************



  // **************************** DIALOGS INICIO ****************************

    showItemPayments( d:any = null ): void {
      const dialogRef = this.dialog.open(ShowItemPaymentsDialog, {
        data: d,
        disableClose: false
      });

      dialogRef.afterClosed().subscribe(result => {
        // if( result == true ){
        //   this.reload.emit( this.data['master']['masterlocatorid'] )
        // }
      });
    }

    cancelHotel( d:any = null ): void {
      const dialogRef = this.dialog.open(CancelHotelDialogComponent, {
        data: { item: d, all: this.data['items']},
        disableClose: true,
        width: '600px',
        maxHeight: '90vh'
      });

      dialogRef.afterClosed().subscribe(result => {
        if( result == true ){
          this.reload.emit( this.data['master']['masterlocatorid'] )
        }
      });
    }

    cancelAssist( d:any = null ): void {
      const dialogRef = this.dialog.open(CancelAssistDialogComponent, {
        data: { item: d, all: this.data['items']},
        disableClose: true,
        width: '600px',
        maxHeight: '90vh'
      });

      dialogRef.afterClosed().subscribe(result => {
        if( result == true ){
          this.reload.emit( this.data['master']['masterlocatorid'] )
        }
      });
    }

     

  // **************************** DIALOGS FIN ****************************

}
