import { Injectable } from '@angular/core';

import * as moment from 'moment-timezone';
import { ZonaHorariaService } from './zona-horaria.service';

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
}
