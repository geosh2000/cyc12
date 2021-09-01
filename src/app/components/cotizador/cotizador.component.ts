import { Component, OnInit, ViewChild } from '@angular/core';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { ApiService, InitService } from 'src/app/services/service.index';

@Component({
  selector: 'app-cotizador',
  templateUrl: './cotizador.component.html',
  styleUrls: ['./cotizador.component.css']
})
export class CotizadorComponent implements OnInit {

  loading = {}
  products = []
  displayModule = 'hotel'

  constructor( private ttl: Title, private _api: ApiService, private toastr: ToastrService, public _init: InitService ) { }

  ngOnInit(): void {
    this.ttl.setTitle('CyC - Cotizador');
    this.getServices()
  }

  matChange( e ){

    this.displayModule = this.products[ e.index ]['title'].toLowerCase()
    
  }

  rsv( e ){
    console.log( e )
  }

  getServices(){
    this.loading['services'] = true

    this._api.restfulGet( '', 'Rsv/getServices' )
                .subscribe( res => {

                  this.loading['services'] = false;

                  this.products = res['data']

                }, err => {
                  this.loading['services'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }


}
