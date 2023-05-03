import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { lstat } from 'fs';
import { filter, map } from 'rxjs/operators';
import { ApiService, AvalonService, GlobalServicesService, InitService } from 'src/app/services/service.index';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-voucher-review',
  templateUrl: './voucher-review.component.html',
  styleUrls: ['./voucher-review.component.css']
})
export class VoucherReviewComponent implements OnInit {

  pagos = []
  trace = {}
  itemData = {}
  accountSum = {}
  accounts = []
  searchFlag = false
  confirmacion = ''
  gotten = false

  constructor( public _api: ApiService,
              public _init: InitService,
              private router: Router,
              private _global: GlobalServicesService,
              private _avalon: AvalonService,
              private activatedRoute: ActivatedRoute ) { 

                this.router.events
                .pipe(
                  filter( event => event instanceof ActivationEnd ),
                  filter( (event: ActivationEnd) => event.snapshot.firstChild === null ),
                  map( (event: ActivationEnd) => event.snapshot.data ),
                )
                .subscribe( data => {
            
                  this.activatedRoute.params.subscribe( params => {
                    let flag = false
        
                    if ( params.conf ){
                      this.getPayments( { value: params.conf } )
                    }
                    
                    
                  });
        
                })

              }

  ngOnInit(): void {
  }

  search( l ){
    this.pagos = []
    Swal.fire('Buscando Loc', l.value, 'info')
    Swal.showLoading()
  
    this._api.restfulPut( { conf: l.value }, 'Rsv/getPayments' )
                .subscribe( res => {

                  Swal.close()
                  this.pagos = res['data']

                }, err => {
                  Swal.close()

                  const error = err.error;
                  // Swal.fire('ERROR',  error.msg, 'error' );
                  this.checkAvalon( l.value )
                  console.error(err.statusText, error.msg);

                });
  }

  getPayments( l, rb = false ){

    if( l.value == '' ){
      Swal.fire('ERROR', 'Indica un numero de confirmacion', 'error');
      return false
    }

    this.pagos = []
    this.trace = {}
    this.itemData = {}
    this.accounts = []
    this.accountSum = {}
    this.confirmacion = l.value
    this.gotten = false

    this.searchFlag = true 
    Swal.fire('Buscando Pagos', rb ? l : l.value, 'info')
    Swal.showLoading()

    let params = { pack: true }

    if( rb ){
      params['ref'] = l
    }else{
      params['conf'] = l.value
    }

    this._api.restfulPut( params, 'Rsv/getItemPayments' )
                .subscribe( res => {

                  for( let ac of res['data'] ){
                    this.accounts.push( ac['accountId'] )
                  }
                  Swal.close()
                  this.pagos = res['data']
                  this.itemData = res['idata']

                  if( this.accounts.length > 0 ){
                    this.getTrace()
                  }

                }, err => {
                  Swal.close()

                  const error = err.error;
                  // Swal.fire('ERROR',  error.msg, 'error' );
                  this.checkAvalon( l.value )
                  console.error(err.statusText, error.msg);

                });
  }

  getTrace(){

    Swal.fire('Obteniendo trazabilidad de los pagos', '', 'info')
    Swal.showLoading()

    this._api.restfulPut( { accounts: this.accounts }, 'Rsv/getPaymentTrace' )
                .subscribe( res => {

                  Swal.close()
                  let trace = {}
                  for( let t of res['data']['trace'] ){
                    if( trace[t['accountId']] ){
                      trace[t['accountId']].push(t)
                    }else{
                      trace[t['accountId']] = [ t ]
                    }
                  }
                  
                  let accountSum = {}
                  for( let t of res['data']['ops'] ){
                    accountSum[t['operacion']] = t
                  }

                  this.trace = trace
                  this.accountSum = accountSum

                }, err => {
                  Swal.close()

                  const error = err.error;
                  Swal.fire('ERROR',  error.msg, 'error' );
                  console.error(err.statusText, error.msg);

                });
  }
  
  getRbVouchers( l ){

    Swal.fire('Obteniendo pagos de Roiback', '', 'info')
    Swal.showLoading()

    this._api.restfulPut( { conf: l }, 'Rsv/getRbVouchers' )
                .subscribe( res => {

                  Swal.close()
                  let trace = {}
                  for( let t of res['data'] ){
                    if( trace[t['operacion']] ){
                      trace[t['operacion']].push(t)
                    }else{
                      this.gotten = true
                      trace[t['operacion']] = [ t ]
                    }
                  }
                  

                  this.trace = trace
                  console.log( this.trace )

                }, err => {
                  Swal.close()

                  const error = err.error;
                  Swal.fire('ERROR',  error.msg, 'error' );
                  console.error(err.statusText, error.msg);

                });
  }

  goToLoc( r ){
    let newRelativeUrl = this.router.createUrlTree(['getVouchers',r]);
    let baseUrl = window.location.href.replace(this.router.url, '');

    window.open(baseUrl + newRelativeUrl, '_blank');
  }

  checkAvalon( l ){

    Swal.fire({
      title: 'Obteniendo información de este item en Avalon...',
      allowOutsideClick: false,
      })
    Swal.showLoading()

    let params = {
      "Hotel": this._global.avalonMap.hoteles[ l.substring(0,3).toLowerCase() ],
      "Localizador": l,
      "NoFiltrarEstado": 'true' 
    }

    this._avalon.restfulGet( params, 'getReservation' )
                .subscribe( res => {

                  if( res['LSReserva'] && res['LSReserva'].length > 0 ){

                    this.getRbVouchers( res['LSReserva'][0]['Localizador'] )
                    console.log( res['LSReserva'] )

                  }else{
                    this._init.snackbar('error', 'No se encontraron reservas en Avalon', 'Error' );
                  }

                  Swal.close()

                }, err => {

                  Swal.close()

                  const error = err.error;
                  this._init.snackbar('error', error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

}
