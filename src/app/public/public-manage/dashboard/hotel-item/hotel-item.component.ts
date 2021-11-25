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
  @Input() master = {}
  @Input() insuranceQuote = {}

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

  assistPrice(){

    if( !this.insuranceQuote['nacional'] ){
      return false
    }

    if( this.master['esNacional'] > 1 ){
      return false
    }

    let seguro = this.insuranceQuote[this.master['esNacional'] == 1 ? 'nacional' : 'internacional']['normal']

    let dias = parseInt(this.item['htlNoches']) + 1
    let pax = parseInt(this.item['adultos']) + parseInt(this.item['juniors']) + parseInt(this.item['menores'])
    let isUsd = this.item['moneda'].toLowerCase() == 'usd'

    let price = (dias * pax * seguro['publico_ci']) * ( isUsd ? 1 : seguro['tipoCambio'])

    console.log( this.item['itemLocatorId'], dias, pax, isUsd, price, isUsd, seguro )
    return price
  }

}
