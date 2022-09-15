import { IfStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  errorExport = {}
  flagExportAll = false
  reportType = "2"

  constructor( 
    public _api: ApiService, 
    public _h: HelpersService, 
    public _init: InitService,
    private _avalon: AvalonService,
    private router: Router
   ) { }

  ngOnInit(): void {
    this.getPending()
  }

  getPending( t = "2" ){

    this.errorExport = {}

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

    this._api.restfulGet( t, 'Rsv/avalonExportables' )
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

    let ml = mlFlag ? i['masterlocatorid'] : i['itemLocatorId']

    Swal.fire({
      title: 'Generando XML...',
      allowOutsideClick: false,
      })
    Swal.showLoading()

    this._api.xmlGet( ml + '/xml', 'Avalon/getRsvArr' )
                .subscribe( res => {

                    this.postToAvalon( res, i, mlFlag )

                }, err => {

                  this.flagExportAll = false
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
              this.flagExportAll = false
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
                .subscribe( async res => {

                  Swal.close()
                  this._init.snackbar('success', 'Confirmados', res['msg'] );
                  
                  if( mlFlag ){
                    await this.removeML( i['masterlocatorid'], mlFlag)
                    if( this.flagExportAll ){
                      this.exportAll()
                    }
                  }else{
                    this.removeItem( i )
                  }

                }, async err => {

                  if( mlFlag ){
                    this.errorExport[i['masterlocatorid']] = this.pendientes[i['masterlocatorid']]
                    await this.removeML( i['masterlocatorid'], mlFlag)
                    if( this.flagExportAll ){
                      this.exportAll()
                    }
                  }

                  // this.flagExportAll = false
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

    return new Promise(resolve => {
      console.log('remove ' + ml)
      if( this.pendientes[ml].length == 0 || f){
        delete this.pendientes[ml]
        resolve( true )
      }
    })
  }

  getPendCount(){
    return Object.keys( this.pendientes ).length
  }

  exportAll(){
    this.flagExportAll = true 
    let ml = ''

    if( Object.keys( this.pendientes ).length == 0 ){
      this._init.snackbar('success', 'Exito', 'Todos los localizadores se han enviado con exito')
      return false
    }

    for( let l in this.pendientes ){
      ml = l
      continue
    }
    
    this.avalonRegister( this.pendientes[ml][0], true )
  }

  goToLoc( r ){
    let newRelativeUrl = this.router.createUrlTree(['rsv',r]);
    let baseUrl = window.location.href.replace(this.router.url, '');

    window.open(baseUrl + newRelativeUrl, '_blank');
  }

}
