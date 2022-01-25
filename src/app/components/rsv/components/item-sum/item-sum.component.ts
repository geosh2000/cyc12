import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment-timezone';
import { InitService, ZonaHorariaService } from 'src/app/services/service.index';

@Component({
  selector: 'app-item-sum',
  templateUrl: './item-sum.component.html',
  styleUrls: ['../main-frame/main-frame.component.css']
})
export class ItemSumComponent implements OnInit {

  @Input() data = {}
  @Output() reload = new EventEmitter

  constructor( 
    private _zh: ZonaHorariaService,
    public _init: InitService
    ) { }

  ngOnInit(): void {
  }

  // **************************** VALIDADORES INICIO ****************************

  isVigente( d ){
    if( moment.tz(d,this._zh.defaultZone).tz(this._zh.zone) > moment() ){
      return true
    }

    return false
  }
  
  // **************************** VALIDADORES FIN ****************************


  // **************************** FORMATOS INICIO ****************************

  formatHistory( t ){
    let r = t

    r = r.replace(/[\n]/gm,'<br>')

    return r
  }

  colorConfirm( i, v = true, q = false ){
    if( !v && q){
      return 'text-danger'
    }

    switch( i ){
      case 'Cancelada':
        return 'text-danger'
      case 'Cotización':
      case 'Cotizacion':
        return 'text-warning'
      case 'Pendiente':
        return 'text-info'
      default:
        return 'text-success'
    }
  }

// **************************** FORMATOS FIN ****************************

}
