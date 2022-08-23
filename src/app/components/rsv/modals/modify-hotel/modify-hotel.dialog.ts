import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService, HelpersService, InitService } from 'src/app/services/service.index';
import { fade, remark } from 'src/app/shared/animations';

import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

import * as moment from 'moment-timezone';
import 'moment/locale/es-mx';
import Swal from 'sweetalert2';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD-MM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'modify-hotel-dialog',
  templateUrl: './modify-hotel.dialog.html',
  styleUrls: ['../../components/main-frame/main-frame.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
  animations: [
    remark,
    fade
  ]
})
export class ModifyHotelDialog implements OnInit {

  hotels = []
  hotelList = {}
  loading = {}

  minDate = moment()
  maxDate = moment(`${moment().add(1, 'years').format('YYYY')}-12-19`)

  constructor(
    public modifyDialog: MatDialogRef<ModifyHotelDialog>,
    public _api: ApiService,
    private _init: InitService,
    public _h: HelpersService,
    @Inject(MAT_DIALOG_DATA) public data) {
      moment.locale('es-mx');

      this.startUp()
    }

  ngOnInit(): void {
  }

  onNoClick( f = null ): void {
    this.modifyDialog.close( f );
  }

  async startUp(){
    await this.getHotelsList()
    this.filterHotels()
  }

  filterHotels(){
    let hotels = []

    for( let i of this.data['items'] ){
      if( i['itemType'] == 1 ){
        i['changes'] = {
          selectedOcc: i['adultos']+'.'+i['juniors']+'.'+i['menores'],
          nights: i['htlNoches'],
          llegada: moment(i['llegada']),
          salida: i['salida']
        }
        
        for( let c of this.hotelList[i['hotel']] ){
          if( i['categoria'] == c['habCode'] ){
            i['changes']['selectedRoom'] = c
            continue
          }
        }
        i['original'] = JSON.parse(JSON.stringify(i))
        hotels.push(i)
      }
    }

    this.hotels = hotels
  }

  getHotelsList(){

    this.loading['hotelList'] = true;

    return new Promise ( resolve => {
      this._api.restfulGet( '', 'Lists/habsListCode' )
                  .subscribe( async res => {

                    this.loading['hotelList'] = false;
                    let result = res['data']

                    let hl = {}

                    for( let i of result ){

                      i['occ'] = await this.occupations(i)

                      if( hl[i['code']] ){
                        hl[i['code']].push(i)
                      }else{
                        hl[i['code']] = [i]
                      }

                    }

                    this.hotelList = hl
                    
                    resolve (true)

                  }, err => {
                    this.loading['hotelList'] = false;

                    const error = err.error;
                    this._init.snackbar('error', error.msg, err.status );
                    console.error(err.statusText, error.msg);
                    resolve (false)

                  });
    })
  }

  occupations( r ){

    return new Promise ( resolve => {
      let occ = []

      for( let a = 1; a <= r['maxAdults']; a++ ){
        occ.push(a + '.0.0')
        for( let c = 1; c <= r['maxChild']; c++ ){
          if( a+c <= r['maxOcc'] ){
            if( c <= 2 ){
              occ.push( `${a}.0.${c}` )
            }else{
              occ.push( `${a}.${c-2}.2` )
            }
          }
        }

      }

      resolve (occ)
    })
  }

  outDateChange( i, e, n ){

    let m = moment( this._h.formatDate( e , 'YYYY-MM-DD') )
    i['changes']['salida'] = this._h.formatDate( m.add(n, 'days') , 'YYYY-MM-DD') 

    this.cotizarCambio( i )
  }

  applyAll( f ){
    let x = 0
    let changes
    for( let i of this.hotels ){
      if( x == 0 ){
        changes = i['changes'][f]

      }else{
        i['changes'][f] = changes

        if( f == 'llegada' || f == 'nights' ){
          this.outDateChange( i, i['changes']['llegada'], i['changes']['nights'] )

        }

        if( f == 'selectedRoom' || f == 'selectedOcc' ){

          if( i['changes']['selectedRoom']['occ'].indexOf(i['changes']['selectedOcc']) < 0 ){
            i['changes']['selectedOcc'] = null
          }
        }
      }

      x++
    }

    
  }

  cotizarCambio( i ){

    console.log(i)

    if( i['changes']['selectedRoom']['occ'].indexOf( i['change ']['selectedOcc'] )  === -1  ){
      Swal.fire('Error en ocupación','No se puede cotizar esta ocupación, cotiza de manera manual','error')
      return false
    }

    if( i['changes']['selectedRoom']['code'] != i['hotel'] ){
      this._init.snackbar('error', 'No es posible modificar el hotel. Debes cancelar y generar un nuevo item', 'ERROR')
      i['changes']['selectedRoom']['code'] = i['hotel']
      i['changes']['selectedRoom']['habCode'] = i['cat']

      return false
    }

    let occ = {
      adultos: i['changes']['selectedOcc'].substr(0,1),
      juniors: i['changes']['selectedOcc'].substr(2,1),
      menores: i['changes']['selectedOcc'].substr(4,1)
    }

    let params = { 
      itemId: i['itemId'], 
      params: { 
        inicio:   i['changes']['llegada'].format('YYYY-MM-DD'),
        fin:      i['changes']['salida'],
        hotel:    i['changes']['selectedRoom']['code'],
        cat:      i['changes']['selectedRoom']['habCode'],
        adultos:   parseInt(occ['adultos']),
        juniors:   parseInt(occ['juniors']),
        menores:   parseInt(occ['menores'])
      }
    }

    i['quoteLoading'] = true;


    this._api.restfulPut( params, 'Rsv/cotizaChangeHotel' )
                .subscribe( res => {

                  i['quoteLoading'] = false;

                  if( i['moneda'].toLowerCase() == 'mxn' ){
                    res['assist']['price'] = res['assist']['price'] * res['assist']['tipocambio']
                  }

                  i['changeQuote'] = { hotel: res['data'], assist: res['assist'] }
                  
                  console.log( i['changeQuote'] )
                  


                }, err => {
                  i['quoteLoading'] = false;

                  delete i['changeQuote']

                  const error = err.error;
                  this._init.snackbar('error', error.msg, err.status );
                  console.error(err.statusText, error.msg);
                })


  }

  packValidate( i ){

    // Flag significa 'keep old' y determina si suma (true) o no (false) el monto del paquete actual

    if( !i['changes'] || i['pkgInsItemIds'] == '[]'){
      return [true, false]
    }

    if( i['pkgItems']['totalPagadoActive'] == 0 ){
      return [false, true]
    }

    let occ = {
      adultos: parseInt(i['changes']['selectedOcc'].substr(0,1)),
      juniors: parseInt(i['changes']['selectedOcc'].substr(2,1)),
      menores: parseInt(i['changes']['selectedOcc'].substr(4,1))
    }

    let llegada = i['changes']['llegada'] != moment(i['llegada'])
    let noches = i['changes']['nights'] > parseInt(i['htlNoches'])
    let paqs = ((parseInt(i['changes']['nights']) + 1) / 8) > i['pkgItems']['items']
    let pax = (occ['adultos'] + occ['juniors'] + occ['menores']) > (parseInt(i['adultos']) + parseInt(i['juniors']) + parseInt(i['menores']))
    let menores = (occ['juniors'] + occ['menores']) > (parseInt(i['juniors']) + parseInt(i['menores']))
    let paxAc = ((occ['adultos'] + occ['juniors'] + occ['menores']) > 4 ? 4 : (occ['adultos'] + occ['juniors'] + occ['menores'])) > i['pkgItems']['pkgInsPax'][i['pkgItems']['pkgInsPax'].length - 1]

    if( llegada ){
      if( paqs ){ return [true, true] }
      else{
        if( pax ){
          if( paxAc ){
            if( menores ){ return [false, true] }else{ return [true, true] }
          }else{ return [true, false] }
        }else{ return [true, false] }
      }
    }else{
      if( noches ){
        if( paqs ){ return [true, true] }
        else{
          if( pax ){
            if( paxAc ){
              if( menores ){ return [false, true] }else{ return [true, true] }
            }else{ return [true, false] }
          }else{ return [true, false] }
        }
      }else{
        if( pax ){
          if( paxAc ){
            if( menores ){ return [false, true] }else{ return [true, true] }
          }else{ return [true, false] }
        }else{ return [true, false] }
      }
    }

  }

  getQuoteTotal(i){

    let pkFlag = this.packValidate( i )

    let pack = i['pkgItems']['totalActive']
    let packIn = i['pkgItems']['totalInactive']

    let total = i['changeQuote']['hotel']['newAmmount'] + i['changeQuote']['assist']['price'] + packIn + (pkFlag[0] ? (pkFlag[1] ? pack : 0) : 0)

    return total
  }

  getQuoteDif( i ){

    let pkFlag = this.packValidate( i )

    let pack = i['pkgItems']['totalActive']
    let packIn = i['pkgItems']['totalInactive']
    let dif = i['changeQuote']['hotel']['difAmmount'] + (i['changeQuote']['assist']['price'] - i['insuranceTotal']) + (pkFlag[0] ? (pkFlag[1] ? pack : 0) : 0)

    return dif
  }

  setChange( i ){

    let pkgFlag = this.packValidate( i )
    let occ = {
      adultos: i['changes']['selectedOcc'].substr(0,1),
      juniors: i['changes']['selectedOcc'].substr(2,1),
      menores: i['changes']['selectedOcc'].substr(4,1)
    }

    let params = {
      original: i,
      changes: {
        monto: i['changeQuote']['hotel']['newAmmount'],
        llegada: i['changes']['llegada'].format('YYYY-MM-DD'),
        salida: i['changes']['salida'],
        nights: i['changes']['nights'],
        adultos:   parseInt(occ['adultos']),
        juniors:   parseInt(occ['juniors']),
        menores:   parseInt(occ['menores']),
        cat: i['changes']['selectedRoom']['habCode'],
      },
      hasIns: parseInt(i['pkgItems']['totalActive']) > 0,
      keepOld: pkgFlag[0],
      pkgNew: pkgFlag[1],
      insRate: i['changeQuote']['assist']['price']
    }

    i['hotelChanging'] = true;


    this._api.restfulPut( params, 'Rsv/changeHotel12' )
                .subscribe( res => {

                  i['hotelChanging'] = false;

                  this._init.snackbar('success', res['msg'], 'Guardado' );
                  this.modifyDialog.close( true );
                  


                }, err => {
                  i['hotelChanging'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, err.status );
                  console.error(err.statusText, error.msg);
                })
    

  }

  
  
}
