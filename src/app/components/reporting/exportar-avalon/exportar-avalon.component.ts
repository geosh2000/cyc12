import { Component, OnInit } from '@angular/core';
import { count } from 'console';
import { ApiService, AvalonService, HelpersService, InitService } from 'src/app/services/service.index';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-exportar-avalon',
  templateUrl: './exportar-avalon.component.html',
  styleUrls: ['./exportar-avalon.component.css']
})
export class ExportarAvalonComponent implements OnInit {

  pendientes = []

  constructor( 
    public _api: ApiService, 
    public _h: HelpersService, 
    public _init: InitService,
    private _avalon: AvalonService
   ) { }

  ngOnInit(): void {
    this.getPending()
  }

  getPending(){

    Swal.fire(
      {
        title: 'Obteniendo reservas pendientes de exportación',
        showCancelButton: false,
        showConfirmButton: false,
        showCloseButton: false,
        allowEscapeKey: false,
        allowOutsideClick: false
      }
    )

    Swal.showLoading()

    this._api.restfulGet( '', 'Rsv/avalonExportables' )
                .subscribe( res => {

                  Swal.close()
                  this.pendientes = res['data']

                }, err => {
                  
                  Swal.close()
                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });

  }

  avalonRegister( i, mlFlag = false ){

    let ml = mlFlag ? i['masterlocatorid'] : i['itemlocatorid']

    Swal.fire({
      title: 'Generando XML...',
      allowOutsideClick: false,
      })
    Swal.showLoading()

    this._api.xmlGet( ml + '/xml', 'Avalon/getRsvArr' )
                .subscribe( res => {

                    this.postToAvalon( res, i, mlFlag )

                }, err => {

                  Swal.close()

                  const error = err.error;
                  this._init.snackbar( 'error', error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  postToAvalon( xml, i, mlFlag ){
    Swal.fire({
      title: 'Enviando XML a Avalon...',
      allowOutsideClick: false,
      })
    Swal.showLoading()
    this._avalon.xmlPost( xml, 'postReservation' )
            .subscribe( res => {

              
              this.uploadAvalonConfirmations( res, i, mlFlag )

            }, err => {

              Swal.close()

              const error = err.error;
              this._init.snackbar( 'error', error.msg, err.status );
              console.error(err.statusText, error.msg);

            });
  }

  uploadAvalonConfirmations( conf, i, mlFlag ){

    Swal.fire({
      title: 'Guardando confirmaciones de Avalon en CYC...',
      allowOutsideClick: false,
      })
    Swal.showLoading()

    this._api.restfulPut( conf, 'Rsv/saveAvalonConfirmation' )
                .subscribe( res => {

                  Swal.close()
                  this._init.snackbar('success', 'Confirmados', res['msg'] );
                  
                  if( mlFlag ){
                    this.removeML( i['masterlocatorid'], mlFlag)
                  }else{
                    this.removeItem( i )
                  }

                }, err => {

                  Swal.close()
                  const error = err.error;
                  this._init.snackbar( 'error', error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }


  removeItem( i ){
    let x = 0
    for( let itm of this.pendientes[i['masterlocatorid']]){
      if( i['itemLocatorId'] == itm['itemLocatorId'] ){
        this.pendientes[i['masterlocatorid']].splice(x, 1); 
      }

      x++;

    } 

    this.removeML( i['masterlocatorid'] )
  }

  removeML( ml, f= false){
    console.log('remove ' + ml)
    if( this.pendientes[ml].length == 0 || f){
      delete this.pendientes[ml]
    }
  }

  getPendCount(){
    return Object.keys( this.pendientes ).length
  }

}
