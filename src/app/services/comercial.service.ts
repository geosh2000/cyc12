import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ComercialService {

  public quoteType:BehaviorSubject<string> = new BehaviorSubject<string>('');
  public lastQuoteType = '';

  public selectedLevel
  public summarySearch = {}
  public hotelSearch: UntypedFormGroup
  public extraInfo = {}
  public cotizadorType = 'comercial'
  public isQuote = true

  public cart = []

  constructor( private _router: Router ) { 
    this._router.events
        .pipe(filter(e => e instanceof NavigationStart))
        .subscribe((e: NavigationStart) => {
          const navigation  = this._router.getCurrentNavigation();
          this.lastQuoteType = navigation.extras.state ? navigation.extras.state.type : '' ;
          this.quoteType.next( navigation.extras.state ? navigation.extras.state.type : '' );
      });
  }


  pricePN( c, tc, h, ss, hs ){
    let nights = this.summarySearch['fin'].diff(this.summarySearch['inicio'], 'days')
    let hotel = ( this.hotelSearch.get('isUSD').value ? 1 : tc ) * c['total']['n' + this.selectedLevel]['monto']
    let seguros = ( (this.extraInfo['grupo']['insuranceIncluded'] ? 1 : 0) * (( this.hotelSearch.get('isUSD').value ? 1 : this.extraInfo['seguros'][h][this.summarySearch['nacionalidad']][this.summarySearch['cobertura']]['tipoCambio']) * this.extraInfo['seguros'][h][this.summarySearch['nacionalidad']][this.summarySearch['cobertura']]['publico_ci']))

    // console.log(nights, hotel, seguros)
    return (hotel + seguros) / nights
  }

  countKeys( o ){
    return Object.keys(o).length
  }

  totalPN( c, l ){
    let hotel = (this.hotelSearch.get('isUSD').value ? 1 : c['tipoCambio']) * c['habs']['total']['monto']['n' + l]['monto']
    let seguro = (this.extraInfo['grupo']['insuranceIncluded'] ? 1 : 0) * (this.hotelSearch.get('isUSD').value ? 1 : this.extraInfo['seguros']['total'][this.summarySearch['nacionalidad']][this.summarySearch['cobertura']]['tipoCambio']) * this.extraInfo['seguros']['total'][this.summarySearch['nacionalidad']][this.summarySearch['cobertura']]['publico_ci']
    let nights = this.summarySearch['fin'].diff(this.summarySearch['inicio'], 'days')

    return (hotel + seguro) / nights

  }

  hotelVal( m, t ){

    if( this.hotelSearch.get('isUSD').value ){
      return m['monto']
    }else{
      if( this.extraInfo['grupo']['fixedMxn'] == '1' ){
        return m['monto_m']
      }else{
        return t * m['monto']
      }
    }
  }

  emptyCart(){
    this.cart = []
  }

  

}
