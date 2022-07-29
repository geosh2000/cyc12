import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'package-builder',
  template: '',
  styleUrls: ['./package-builder.component.css']
})
export class PackageBuilderComponent implements OnInit {

  insPaxRate = 6.5 * 1.16

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
      days: days
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
    let pax = d['occ']['adultos'] ?? 0 + d['occ']['juniors'] ?? 0 + d['occ']['menores'] ?? 0
    
    // Evalua minimo de pax para seguro o descuento
    let startPax = 4
    for( let p = startPax; p >= pax; p -= 2 ){
      result = {
        level: 'n' + this.levelCorrect((insRate * p) / lCompare + (.05 * (cl-1)), cl),
        lnumber: this.levelCorrect((insRate * p) / lCompare + (.05 * (cl-1)), cl),
        rate: (this.hotelVal(d['total']['n' + this.levelCorrect((insRate * p) / lCompare + (.05 * (cl-1)), cl)], t, usd, g)).toFixed(2),
        hotelRate: (this.hotelVal(d['total']['n' + cl], t, usd, g) - (p * insRate)).toFixed(2),
        tipoCambio: (parseFloat(t) + 1).toFixed(2),
        insRate: (this.insPaxRate * p * (usd ? 1 : parseFloat(t) + 1)).toFixed(2),
        pax: p,
        total: (this.hotelVal(d['total']['n' + this.levelCorrect((insRate * p) / lCompare + (.05 * (cl-1)), cl)], t, usd, g) + p * insRate).toFixed(2),
        dif: (this.hotelVal(d['total']['n' + cl], t, usd, g) - (this.hotelVal(d['total']['n' + this.levelCorrect((insRate * p) / lCompare + (.05 * (cl-1)), cl)], t, usd, g) + (this.insPaxRate * p * (usd ? 1 : parseFloat(t) + 1)))).toFixed(2),
        cRate: (this.hotelVal(d['total']['n' + cl], t, usd, g)).toFixed(2),
        paqs: insQ,
        days: days
      }

      if( (insRate * p) / lCompare <= cLevel ){

        return type == 'array' ? result : result[type]
      }

    }

    return type == 'array' ? result : result[type]
    

    // El resultado depende del flag rate --> true devuelve el descuento, false devuelve los pax

  }

  levelCorrect( d, cl ){

    let levels = [.05, .1, .15, .2]
    let i = 2

    for( let l of levels ){
      if( d <= l ){
        if( i == 3 && cl == 2 && d <= .07 ){
          return 5
        }

        return i
      }

      i++
    }

    return 4

  }

}
