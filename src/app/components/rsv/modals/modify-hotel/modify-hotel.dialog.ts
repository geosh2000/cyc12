import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService, HelpersService, InitService } from 'src/app/services/service.index';
import { fade, remark } from 'src/app/shared/animations';

import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

import * as moment from 'moment-timezone';
import 'moment/locale/es-mx';

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
  
}
