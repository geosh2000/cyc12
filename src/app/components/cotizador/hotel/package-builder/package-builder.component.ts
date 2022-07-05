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

  defInsPaq( d, cl, type ){

    if( cl == 4 ){
      return 'N/A'
    }

    let result = {
      level: 'n1',
      rate: 0,
      pax: 0,
      total: 0,
      dif: (0-0).toFixed(2),
      cRate: (0-0).toFixed(2),
    }

    if( result[type] === undefined ){
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
    let startPax = pax > 4 ? pax : 4
    for( let p = startPax; p >= pax; p -= 2 ){
      result = {
        level: 'n' + this.levelCorrect((this.insPaxRate * p) / lCompare + (.05 * (cl-1)), cl),
        rate: (d['total']['n' + this.levelCorrect((this.insPaxRate * p) / lCompare + (.05 * (cl-1)), cl)]['monto']).toFixed(2),
        pax: p,
        total: (d['total']['n' + this.levelCorrect((this.insPaxRate * p) / lCompare + (.05 * (cl-1)), cl)]['monto'] + p * this.insPaxRate).toFixed(2),
        dif: (d['total']['n' + cl]['monto'] - (d['total']['n' + this.levelCorrect((this.insPaxRate * p) / lCompare + (.05 * (cl-1)), cl)]['monto'] + p * this.insPaxRate)).toFixed(2),
        cRate: (d['total']['n' + cl]['monto']).toFixed(2),
      }

      if( (this.insPaxRate * p) / lCompare <= cLevel ){
        return result[type]
      }

    }

    return result[type]

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
