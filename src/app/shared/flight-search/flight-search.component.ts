import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/service.index';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css']
})
export class FlightSearchComponent implements OnInit {

  constructor(
    private _api: ApiService
  ) { }

  ngOnInit(): void {
  }

  selectFlight( start, flight, arrv = true ){

    // console.log('start search')
    return new Promise(async resolve => {
      Swal.fire({
        title: `<strong>Obteniendo Vuelos</strong>`,
        focusConfirm: false,
        showCancelButton: false,
      })

      Swal.showLoading()

      let res = await this.getFlight(start, flight, arrv)
      resolve( res )
    })
    
  }

  getFlight( start, flight, arrv = true ){

    return new Promise(async resolve => {
      // console.log('start search')

      this._api.restfulGet( `${ arrv ? 1 : 0 }/${ start }/${ flight }`, 'Cmaya/fa_flightSearch' )
                  .subscribe( async res => {

                    let template = this.buildFlightOpts( res['data'], 'flightsAvailable', arrv )

                    Swal.close()

                    if( template['0'] ){
                      let result = await this.selector( res['data'], template )           
                      resolve( result )
                    }else{
                      Swal.fire('Sin Resultados', 'No hay vuelos con estos datos', 'error')
                    }

                    resolve( false )


                  }, err => {

                    Swal.close()

                    const error = err.error;
                    Swal.fire('Error de conexión', error.msg, 'error')
                    console.error(err.statusText, error.msg);

                    resolve( null )

                  });
    })

  }

  buildFlightOpts( r, n, arrv ){

    let i = 0
    let arr = {}

    for( let f of r ){
      arr[i.toString()] = `<span class="text-primary"><b>${ f['ident'] }</b></span> -> ${ arrv ? '➘: ' : '⬈: '} <span class="text-success">${ f[ arrv ? 'arrivaltime' : 'departuretime' ] } hrs</span>`   
      i++
    }

    return arr
  }

  async selector( arr, r ) {

    
    const { value: flight } = await Swal.fire({
      title: `<strong>Vuelos Disponibles</strong>`,
      input: 'radio',
      customClass: {
        input: 'swal-radio'
      },
      inputOptions: r,
      inputValidator: (value) => {
        if (!value) {
          return 'Debes elegir un valor!'
        }
      },
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    })

    return new Promise(async resolve => {
      if ( flight ) {
        return resolve(arr[flight])
      }
    })
  }

}
