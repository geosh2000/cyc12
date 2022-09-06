import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'package-builder-2',
  template: '',
  styleUrls: ['./package-builder-v2.component.css']
})
export class PackageBuilderV2Component implements OnInit {

  insPaxRate = 6.5 * 1.16
  insPaqRate = 105 * 1.16

  constructor() { }

  ngOnInit(): void {
  }

  hotelVal( m, t, usd, g ){

    if( usd ){
      return +( m['monto'] ).toFixed(2)
    }else{
      if( g['fixedMxn'] == '1' ){
        return +( m['monto_m'] ).toFixed(2)
      }else{
        return +( t * m['monto'] ).toFixed(2)
      }
    }
  }

  defInsPaq( d, cl, type, t, usd, g ){

    let days = Object.keys(d['fechas']).length + 1
    let insQ = Math.ceil( days / 8 )
    let insRate = this.insPaxRate * insQ * (usd ? 1 : parseFloat(t) + 1)
    let insPaqRate = this.insPaqRate * (usd ? 1 : parseFloat(t) + 1)

    if( cl == 4 ){
      return 'N/A'
    }

    let result = {
      level: 'n1',
      lnumber: 1,
      rate: (0-0).toFixed(2),
      hotelRate: (0-0).toFixed(2),
      tipoCambio: (parseFloat(t) + 1).toFixed(2),
      insRate: (0-0).toFixed(2),
      pax: 0,
      total: (0-0).toFixed(2),
      dif: (0-0).toFixed(2),
      cRate: (0-0).toFixed(2),
      paqs: insQ,
      days: days,
      tipo: 'undefined'
    }

    if( result[type] === undefined && type != 'array'){
      return result[type]
      return 'N/A'
    }

    // Tarifas iniciales
    let neta = d['total']['neta']['monto']
    
    // Nivel a comparar
    let cLevel = .05
    let lName = cl == 1 ? 'neta' : 'n' + (cl-1)
    let lCompare = d['total'][lName]['monto']

    // Define ocupacion
    let pax = (d['occ']['adultos'] ?? 0 ) + (d['occ']['menores'] ?? 0)
    
    // Evalua minimo de pax para seguro o descuento
    result = {
      level: 'n' + '4',
      lnumber: 4,
      rate: (this.hotelVal(d['total']['n' + '4'], t, usd, g)).toFixed(2),
      hotelRate: (this.hotelVal(d['total']['n' + cl], t, usd, g) - (4 * insRate)).toFixed(2),
      tipoCambio: (parseFloat(t) + 1).toFixed(2),
      insRate: (this.insPaxRate * 4 * (usd ? 1 : parseFloat(t) + 1)).toFixed(2),
      pax: 4,
      total: (this.hotelVal(d['total']['n' + '4'], t, usd, g) + 4 * insRate).toFixed(2),
      dif: (this.hotelVal(d['total']['n' + cl], t, usd, g) - (this.hotelVal(d['total']['n' + '4'], t, usd, g) + (this.insPaxRate * 4 * (usd ? 1 : parseFloat(t) + 1)))).toFixed(2),
      cRate: (this.hotelVal(d['total']['n' + cl], t, usd, g)).toFixed(2),
      paqs: insQ,
      days: days,
      tipo: 'inclusion'
    }

    if( parseFloat(result['dif']) < 0 && pax <= 2 ){
      result = {
        level: 'n' + '4',
        lnumber: 4,
        rate: (this.hotelVal(d['total']['n' + '4'], t, usd, g)).toFixed(2),
        hotelRate: (this.hotelVal(d['total']['n' + cl], t, usd, g) - (2 * insRate)).toFixed(2),
        tipoCambio: (parseFloat(t) + 1).toFixed(2),
        insRate: (this.insPaxRate * 2 * (usd ? 1 : parseFloat(t) + 1)).toFixed(2),
        pax: 2,
        total: (this.hotelVal(d['total']['n' + '4'], t, usd, g) + 2 * insRate).toFixed(2),
        dif: (this.hotelVal(d['total']['n' + cl], t, usd, g) - (this.hotelVal(d['total']['n' + '4'], t, usd, g) + (this.insPaxRate * 2 * (usd ? 1 : parseFloat(t) + 1)))).toFixed(2),
        cRate: (this.hotelVal(d['total']['n' + cl], t, usd, g)).toFixed(2),
        paqs: insQ,
        days: days,
        tipo: 'inclusion'
      }
    }

    if( (parseFloat(result['cRate']) - parseFloat(result['rate'])) > insPaqRate ){
      // TO ENABLE WHEN HIGH OK
      // result = this.highPaqAdjunst( result, d['total'], cl, t, usd, g )
    }


    return type == 'array' ? result : result[type]
    

    // El resultado depende del flag rate --> true devuelve el descuento, false devuelve los pax

  }

  highPaqAdjunst( r, total, cl, t, usd, g ){

    let insPaqRate = this.insPaqRate

      r['hotelRate']    = (this.hotelVal(total['n' + cl], t, usd, g) - insPaqRate).toFixed(2),
      r['insRate']      = (insPaqRate * (usd ? 1 : parseFloat(t) + 1)).toFixed(2),
      r['pax']          = 4,
      r['total']        = (this.hotelVal(total['n' + '4'], t, usd, g) + insPaqRate).toFixed(2),
      r['dif']          = (this.hotelVal(total['n' + cl], t, usd, g) - (this.hotelVal(total['n' + '4'], t, usd, g) + (insPaqRate * (usd ? 1 : parseFloat(t) + 1)))).toFixed(2),
      r['cRate']        = (this.hotelVal(total['n' + cl], t, usd, g)).toFixed(2),
      r['paqs']         = 1,
      r['days']         = 8 
      r['tipo']         = 'paquete100' 

      return r
  }

}
