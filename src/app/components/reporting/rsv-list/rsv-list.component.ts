import { Component, OnInit } from '@angular/core';
import { ApiService, InitService } from 'src/app/services/service.index';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-rsv-list',
  templateUrl: './rsv-list.component.html',
  styleUrls: ['./rsv-list.component.css']
})
export class RsvListComponent implements OnInit {

  searchTerm: string;
  dates = {
    creacion: {},
    llegada: {},
    salida: {},
  }

  list = []

  constructor( private _init: InitService, private _api: ApiService ) { }

  ngOnInit(): void {
  }

  clearDate( v ){
    this.dates[v]['inicio'] = null
    this.dates[v]['fin'] = null
  }

  search(){
    let flag = false

    for( let d in this.dates ){
      if( this.dates[d]['inicio'] ){
        flag = true
        break
      }
    }

    if( !flag ){
      this._init.snackbar('error', 'Error', 'Necesitas ingresar al menos una fecha para iniciar la búsqueda')
      return false
    }

    this.doSearch()
  }

  doSearch(){

    Swal.fire({
      title: 'Buscando reservas...'
    })

    Swal.showLoading()

    let params = {
      dates: this.dates
    }

    this._api.restfulPut( params, 'Rsv/getRsvList' )
                .subscribe( res => {

                  Swal.close()
                  this.list = res['data']

                }, err => {
                  
                  Swal.close()
                  const error = err.error;
                  this._init.snackbar('error', error.msg ?? err.statusText, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });

  }

}
