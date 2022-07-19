import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ApiService, InitService } from 'src/app/services/service.index';

@Component({
  selector: 'app-insurance-manage',
  templateUrl: './insurance-manage.component.html',
  styleUrls: ['./insurance-manage.component.css']
})
export class InsuranceManageComponent implements OnInit {

  @Output() reload = new EventEmitter()

  data =  {}
  insurancesQ = {}
  loading = {}

  constructor(
    public _api: ApiService,
    public _init: InitService,
  ) { }

  ngOnInit(): void {
  }

  async loadIns( d ){
    this.loading['insurance'] = true

    await this.getInsuranceData( d )
    this.loading['insurance'] = false
  }

  getInsuranceData( d ){

    return new Promise( async resolve => {

        this.loading['cotizando'] = false
        this.data = d
    
        for( let i of this.data['items'] ){
          if( i['itemType'] == '1' ){
            let tmpIns = this.getRelatedInsurance(d['items'], i['itemLocatorId'])
            i['seguros'] = tmpIns
            i['monto'] = parseFloat(i['monto'])
            i['traspaso'] = null
          }
        }
    
        await this.getQuote()

        resolve(true) 
    })
  }

  getRelatedInsurance( d, i ){
    console.log( d )
    let resultado = d.find( related => related.sg_itemRelatedStatus === i + '-0' );
    if( resultado != null ){
      resultado['monto'] = parseFloat(resultado['monto'])
    }
    return resultado

  }

  getQuote(){

    return new Promise( async resolve => {
      console.log('called get quote')
      this.loading['cotizando'] = true

      this._api.restfulPut( this.data, 'Assistcard/multiQuote' )
                  .subscribe( res => {

                    this.loading['cotizando'] = false;
                    this.insurancesQ = res['data']

                    resolve(true)

                  }, err => {
                    this.loading['cotizando'] = false;

                    const error = err.error;
                    this._init.snackbar( 'error', error.msg, err.status );
                    console.error(err.statusText, error.msg);

                    resolve(false)

                  });
    })
  }

  consistentInsurance(i, bl = false){
    let s = i['seguros']

    let complex = {
      'goc': 'cancun',
      'pyr': 'cancun',
      'ohoc': 'cancun',
      'gop': 'palm',
      'opb': 'palm',
      'smart': 'smart',
      'oh': 'smart',
    }

    let msg = ''

    if( i['llegada'] != s['llegada'] ){
      if( bl ){
        return false
      }else{
        msg += msg == '' ? 'Fecha de llegada' : ', Fecha de llegada'
      }
    }

    if( i['salida'] != s['salida'] ){
      if( bl ){
        return false
      }else{
        msg += msg == '' ? 'Fecha de salida' : ', Fecha de salida'
      }
    }

    if( (parseInt(i['adultos'])+parseInt(i['juniors'])+parseInt(i['menores'])) != s['sg_pax'] ){
      if( bl ){
        return false
      }else{
        msg += msg == '' ? 'Cantidad de pax' : ', Cantidad de pax'
      }
    }

    if( complex[i['hotel'].toLowerCase] != complex[s['hotel'].toLowerCase] ){
      if( bl ){
        return false
      }else{
        msg += msg == '' ? 'Complejo' : ', Complejo'
      }
    }

    if( bl ){
      return true
    }else{
      if( msg != '' ){
        return msg + ' distintos'
      }else{
        return 'Todo OK'
      }
    }
  }

  dias(n){
    return parseInt(n)+1
  }

  genInsurance( i, s, m, c ){
    i['loading'] = true

    let params = {
      masterLoc: this.data['master']['masterlocatorid'],
      itemId: i['itemId'],
      type: 'seguro',
      master: {
        languaje: this.data['master']['languaje']
      },
      item: {
        sg_pax: parseInt(i['adultos'])+parseInt(i['juniors'])+parseInt(i['menores']),
        sg_hotel: i['hotel'],
        sg_itemRelated: i['itemLocatorId'],
        sg_inicio: i['llegada'],
        sg_fin: i['salida'],
        sg_mdo: m,
        sg_cobertura: c
      },
      monto: {
        monto: s[m][c]['publico_ci'] * (i['moneda'] == 'MXN' ? s[m][c]['tipoCambio'] : 1),
        moneda: i['moneda'],
      }
    }

    this._api.restfulPut( params, 'Rsv/saveRsv' )
                .subscribe( res => {

                  i['loading'] = false;
                  console.log( res['data'] )
                  this._init.snackbar( 'success', 'Item de seguro generado correctamente', 'Item Creado' );
                  this.reload.emit(true)

                }, err => {
                  i['loading'] = false;

                  const error = err.error;
                  
                  console.error(err.statusText, error.msg);

                });
  }
  
  modifyInsurance( i, s, m, c ){
    i['loading'] = true

    let params = {
      masterLoc: this.data['master']['masterlocatorid'],
      mlTicket: this.data['master']['mlTicket'],
      itemId: i['itemId'],
      seguro: i['seguros'],
      traspaso: i['traspaso'],
      item: {
        sg_pax: parseInt(i['adultos'])+parseInt(i['juniors'])+parseInt(i['menores']),
        sg_hotel: i['hotel'],
        sg_itemRelated: i['itemLocatorId'],
        sg_inicio: i['llegada'],
        sg_fin: i['salida'],
        sg_mdo: m,
        sg_cobertura: c,
        itemId: i['seguros']['itemId']
      },
      monto: {
        monto: c == '' ? 0 : (s[m][c]['publico_ci'] * (i['moneda'] == 'MXN' ? s[m][c]['tipoCambio'] : 1)),
        moneda: i['moneda'],
        itemId: i['seguros']['itemId']
      }
    }

    this._api.restfulPut( params, 'Rsv/modifyInsurance' )
                .subscribe( res => {

                  i['loading'] = false;
                  console.log( res['data'] )
                  this._init.snackbar( 'success', 'Item de seguro modificado correctamente', 'Item Ajustado' );
                  this.reload.emit(true)

                }, err => {
                  i['loading'] = false;

                  const error = err.error;
                  this._init.snackbar('error', err.statusText, error.msg );
                  console.error(err.statusText, error.msg);

                });
  }

}
