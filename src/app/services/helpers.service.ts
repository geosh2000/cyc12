import { Injectable } from '@angular/core';

import * as moment from 'moment-timezone';
import { ZonaHorariaService } from './zona-horaria.service';

declare var jQuery:any;

@Injectable({
  providedIn: 'root'
})
export class HelpersService {

  constructor( private _zh: ZonaHorariaService ) { }

  formatDate( d, f, z = false ){
    if( z ){
      return moment.tz(d,this._zh.defaultZone).tz(this._zh.zone).format(f)
    }else{
      return moment(d).format(f)
    }
  }

  copyToClipboard( t ) {
    let d = jQuery('<input>').val(t).appendTo('body').select()
    document.execCommand('copy')
    d.remove()
  }

  occup( i ){

    return `${ i['adultos'] }.${ i['juniors'] }.${ i['menores'] }`
    
  }

  isVigente( d ){
    if( moment.tz(d,this._zh.defaultZone).tz(this._zh.zone) > moment() ){
      return true
    }

    return false
  }

  moneyCents( a ){
    let v = parseFloat(a) * 100
    return  Math.round(v)
  }

  moneyInts( a ){
    return a / 100 
  }

  moneyFormat( a ){
    return this.moneyInts( this.moneyCents(a) )
  }

  excelDate( excelDate, dt = false ) {
    
    if( excelDate == null ){
      return null
    }

    let intDate = parseInt(excelDate)
    let xlsDate = new Date((intDate  - 25568 ) * 86400000).toLocaleDateString('en-US');

    let date = moment( xlsDate, 'MM/DD/YYYY');
    let daytime = ''

    if( dt ){

      let day_time = excelDate % 1
      // let meridiem = "AMPM"
      let hour = Math.floor(day_time * 24)
      let minute = Math.floor(Math.abs(day_time * 24 * 60) % 60)
      let second = Math.floor(Math.abs(day_time * 24 * 60 * 60) % 60)
      // hour >= 12 ? meridiem = meridiem.slice(2, 4) : meridiem = meridiem.slice(0, 2)
      // hour > 12 ? hour = hour - 12 : hour = hour

      daytime = " " + ( hour < 10 ? "0" + hour : hour ) + ":" + ( minute < 10 ? "0" + minute : minute ) + ":" + ( second < 10 ? "0" + second : second )

    }

    return date.format('YYYY-MM-DD') + daytime;
  }
}
