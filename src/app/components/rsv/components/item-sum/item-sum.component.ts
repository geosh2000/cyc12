import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment-timezone';
import { ApiService, HelpersService, InitService, ZonaHorariaService } from 'src/app/services/service.index';
import Swal from 'sweetalert2';

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

  loading = {}

  constructor( 
    private _zh: ZonaHorariaService,
    public _init: InitService,
    public _api: ApiService,
    public _h: HelpersService,
    public dialog: MatDialog
    ) { }

  ngOnInit(): void {
  }

  // **************************** VALIDADORES INICIO ****************************

  
  // **************************** VALIDADORES FIN ****************************


  // **************************** APIS FIN ****************************
  
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

     

  // **************************** DIALOGS FIN ****************************

}
