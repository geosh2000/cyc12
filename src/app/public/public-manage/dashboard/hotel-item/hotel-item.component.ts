import { Component, Input, OnInit } from '@angular/core';
import { GlobalServicesService } from 'src/app/services/service.index';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-hotel-item',
  templateUrl: './hotel-item.component.html',
  styleUrls: ['./hotel-item.component.css']
})
export class HotelItemComponent implements OnInit {

  @Input() item = {}

  constructor( public _trl: GlobalServicesService ) { }

  ngOnInit(): void {
  }

  ft( t ){
    switch( this._trl.displayLanguage ){
      case 'idioma_en':
        return moment(t).format('YYYY-MM-DD')
        default:
        return moment(t).format('DD-MM-YYYY')
    }
  }

  num( n ){
    return parseFloat(n)
  }

}
