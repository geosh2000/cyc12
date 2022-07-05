import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ComercialService } from 'src/app/services/comercial.service';

import * as moment from 'moment-timezone';
import 'moment/locale/es-mx';
import { HelpersService, InitService } from 'src/app/services/service.index';
import { SendRoomComponent } from '../send-room/send-room.component';

@Component({
  selector: 'display-options',
  templateUrl: './display-options.component.html',
  styleUrls: ['./display-options.component.css']
})
export class DisplayOptionsComponent implements OnInit {

  @ViewChild( SendRoomComponent, { static: false } ) _send: SendRoomComponent;

  breakLineHotel = ''

  @Input() cotizacion = []
  @Input() oportunidad

  cart = []

  constructor( public _com: ComercialService, public _h: HelpersService, public _init: InitService ) { }

  ngOnInit(): void {
  }

  hotelBreak( h ){
    if( h != this.breakLineHotel ){
      this.breakLineHotel = h
      return true
    }
    
    return false
  }

  mmnt( d, t ){

    if( t == 'min' ){
      return moment(d['dateStart'])
    }

    return moment(d['dateEnd']) 
  }

  addCart( c, hab, h, s, n ){

    if( !s || !n || h <= 0 || s == null || n == null){
      this._init.snackbar('error', `Faltan elementos para agregar habitacion al carrito`, '')
      return false
    }

    let hb = c['habs']['porHabitacion'][hab]

    let occ = {
      1: 'Sencilla',
      2: 'Doble',
      3: 'Triple',
      4: 'Cuadruple'
    }

    let r = {
      "Divisa": this._com.summarySearch['isUSD'] ? 'USD' : 'MXN',
      "Complejo":c['complejoSF'],
      "Hotel": c['hotelName'],
      "TipoHabitacion": c['habName'],
      "TipoOcupacion": occ[hb['occ']['adultos']],
      "Tarifa": this._h.moneyFormat( hb['total']['n1']['monto'] ),
      "CantidadHabitaciones": h,
      "FechaLlegada": s.format('YYYY/MM/DD'),
      "FechaSalida": moment( s.format('YYYY/MM/DD') ).add(n, 'days').format('YYYY/MM/DD'),
      "CantidadHuespedes": hb['occ']['adultos'],
      "Notas": ''
    }

    this._com.cart.push( r )

    this._init.snackbar('success', `Habitación ${c['habCode']} agregada al carrito`, '')

  }

  valEnd( b, e ){

    let date = e.value

    if( !b['selectedNoches'] ){
      b['selectedNoches'] = this.maxNights( b, date )
    }


    if( b['selectedNoches'] > this.maxNights(b, date) ){
      b['selectedNoches'] = this.maxNights( b, date )
    }

    b['selectedEnd'] = moment(date.format('YYYY-MM-DD')).add(b['selectedNoches'],'days')
    // console.log( b['selectedNoches'], moment(date.format('YYYY-MM-DD')).add(b['selectedNoches'],'days') )

  }

  chgNights( b, n ){

    let s = b['selectedStart'] ? b['selectedStart'] : moment(b['dateStart'])
    console.log( n.target.value , s.format('YYYY-MM-DD') )

    b['selectedEnd'] = moment( s.format('YYYY-MM-DD')).add( n.target.value,'days')
  }

  maxNights( b, d = null ){

    let s = b['selectedStart'] > moment(b['dateStart']) ? b['selectedStart'] : b['dateStart']
    if( d != null ){
      s = d > moment(b['dateStart']) ? d : b['dateStart']
    }

    return moment( moment(b['dateEnd']).add(1,'days').format('YYYY-MM-DD') ).diff( s, 'days' )
  }

  lastNight( e ){
    return moment( e ).add(1,'days').format('YYYY-MM-DD')
  }

  sendRoom( r ){
    this._send.buildQuote( r )
  }

  

}
