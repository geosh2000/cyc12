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
}
