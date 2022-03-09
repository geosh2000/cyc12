import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService, HelpersService, InitService, ZonaHorariaService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderPipe } from 'ngx-order-pipe';
import Swal from 'sweetalert2';
import { MatStepper } from '@angular/material/stepper';


@Component({
    selector: 'saldar-dialog',
    templateUrl: './saldar-dialog.html',
    styleUrls: ['../../components/main-frame/main-frame.component.css']
})
export class SaldarDialog implements OnInit {

  @ViewChild('stepper') _stp:MatStepper

  loading = {}
  saldables = {
    USD: [],
    MXN: []
  }

  opsRes = []
  remaining = 0

  selectAccount:FormGroup
  selectItems:FormGroup

  accSaldo = 0
  items = []

  constructor(
    public saldarDialog: MatDialogRef<SaldarDialog>,
    public _api: ApiService,
    public _h: HelpersService,
    private _init: InitService,
    private _formBuilder: FormBuilder,
    private orderPipe: OrderPipe,
    @Inject(MAT_DIALOG_DATA) public data) {

      this.selectAccount = this._formBuilder.group({
        selectedAccount: ['', Validators.required]
      });

      this.selectItems = this._formBuilder.group({
        selectedItems: ['', Validators.required]
      });

    }

  async ngOnInit(){
    await this.filterExp()
    this.search( this.data['master']['masterlocatorid'] )
  }

  onNoClick(): void {
    this.saldarDialog.close( null );
  }

  filterExp(){
    let saldableUSD = []
    let saldableMXN = []

    for( let i of this.data['items'] ){
      if( this._h.isVigente(i['vigencia']) && i['isCancel'] == 0 && i['montoSaldoTotal'] > 0 && i['grupo'] != 'ohr' ){

        i['montoAllPaid'] = this._h.moneyInts( this._h.moneyCents(i['montoPagado']) + this._h.moneyCents(i['montoEnValidacion']) )
        i['montoParcialOriginal'] = i['montoParcial']

        if( i['moneda'] == 'USD' ){
          saldableUSD.push( i )
        }else{
          saldableMXN.push( i )
        }
      }
    }

    this.saldables = {
      USD: saldableUSD,
      MXN: saldableMXN
    }
  }

  search( f ){

    this.loading['search'] = true;

    this._api.restfulPut( {searchString: f, locFlag:true }, 'Rsv/listPaymentsV12' )
                .subscribe( res => {

                  this.loading['search'] = false;
                  let result = res['data']

                  if( res['data'].length == 0 ){
                    Swal.fire('Sin Resultados', 'No se encontraron pagos con estos criterios', 'error')
                    return true
                  }

                  result = this.orderPipe.transform(result, 'dtCreated', true)
                  this.opsRes = result

                }, err => {
                  this.loading['search'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  select( i ){

    if( this.saldables[i['moneda']].length == 0 ){
      Swal.fire(`Sin Reservas en ${ i['moneda']}`, 'No hay reservas en esta moneda, o las existentes no cuentan con saldo pendiente. Elige un pago con moneda distinta', 'warning')
      return true
    }

    this.selectAccount.get('selectedAccount').setValue( i )
    this.accSaldo = this._h.moneyInts( this._h.moneyCents(i['montoSaldo']) )
    this.remaining = this._h.moneyInts( this._h.moneyCents( i['montoSaldo'] ) )
    this._stp.next()

  }

  getTotals(total,i){

    return new Promise ( resolve => {

      if( this._h.moneyCents(this.accSaldo) - this._h.moneyCents(total) < 0 ){
        
        i['toPay'] -= this._h.moneyInts( this._h.moneyCents(total) - this._h.moneyCents(this.accSaldo) )
        this._init.snackbar('alert','El saldo no es suficiente para ingresar ese monto, se ha ajustado el monto para que el saldo quede en 0. Puedes continuar con la operación', 'Monto inválido')
        resolve( true )
      }else{
        this.remaining = this._h.moneyInts( this._h.moneyCents(this.accSaldo) - this._h.moneyCents(total) )
        resolve( false )
      }

    })
    
  }

  sumRemain(){
    let saldo = this._h.moneyCents(this.selectAccount.get('selectedAccount').value['montoSaldo'] ?? 0)
    let pago = 0
    for( let i of (this.saldables[this.selectAccount.get('selectedAccount').value['moneda']] ?? []) ){
      pago += this._h.moneyCents(i['toPay'] ?? 0)
    }

    return this._h.moneyInts( saldo - pago )
  }

  onSelect( e, i, el ){

    let sel = JSON.parse(JSON.stringify(this.saldables[this.selectAccount.get('selectedAccount').value['moneda']] ?? []))
    let remaining = this.sumRemain()

    if( !e.checked ){
      let index = sel.indexOf(i)
      sel.splice(index,1)
    }else{
      if(remaining <= 0){
        this._init.snackbar('error','No queda saldo suficiente para agregar otro item.', 'Error!')
        el['selected'] = false
        el['toPay'] = 0
        return false
      }
      sel.push(i)
    }

    sel.sort()
    this.items = sel
    this.selectItems.get('selectedItems').setValue(JSON.stringify(sel))

    let x = 0;
    let itms = (this.saldables[this.selectAccount.get('selectedAccount').value['moneda']] ?? [])
    
    for( let it of  itms){
      if( i == it['itemId'] ){
        if( e.checked ){

          let toPay = this._h.moneyInts( (this._h.moneyCents(it['montoParcial']) - this._h.moneyCents(it['montoAllPaid'])) > 0 ? ( this._h.moneyCents(it['montoParcial']) - this._h.moneyCents(it['montoAllPaid'])) : (this._h.moneyCents(it['monto']) - this._h.moneyCents(it['montoAllPaid'])) )
          if( this._h.moneyCents(remaining) - this._h.moneyCents(toPay) < 0 ){
            itms[x]['toPay'] = this._h.moneyInts( this._h.moneyCents(remaining) )
            this._init.snackbar('error', 'El saldo no es suficiente para ingresar ese monto, se ha ajustado el monto para que el saldo quede en 0', 'Monto inválido')
            remaining -= this._h.moneyInts(this._h.moneyCents(itms[x]['toPay']))
          }else{
            itms[x]['toPay'] = this._h.moneyInts( (this._h.moneyCents(it['montoParcial']) - this._h.moneyCents(it['montoAllPaid'])) > 0 ? (this._h.moneyCents(it['montoParcial']) - this._h.moneyCents(it['montoAllPaid'])) : (this._h.moneyCents(it['monto']) - this._h.moneyCents(it['montoAllPaid'])) )
            remaining -= this._h.moneyInts(this._h.moneyCents(itms[x]['toPay']))
          }
        }else{
          remaining += this._h.moneyInts(this._h.moneyCents(itms[x]['toPay']))
          itms[x]['toPay'] = 0
        }
        return true
      }
      x++
    }
  }

  changeAmmount(v, i){

    if( v > this._h.moneyInts( this._h.moneyCents(i['monto']) - this._h.moneyCents(i['montoPagado'])) ){
      i['toPay'] = this._h.moneyInts( this._h.moneyCents(i['monto']) - this._h.moneyCents(i['montoPagado']))
      this._init.snackbar('alert', 'El monto elegido sobrepasa el monto adeudado. Se modificó el monto a pagar. Quedará un saldo a favor', 'Monto inválido')
    }

    if( v < 0 ){
      i['toPay'] = 0
      this._init.snackbar('error', 'El monto no puede ser negativo', 'Monto inválido')
    }

  }

  async saldar(){
    let totals = await this.buildCheckOut()
    // console.log( totals )

    this.loading['saldar'] = true;

    this._api.restfulPut( totals, 'Rsv/checkOutV12' )
                .subscribe( res => {

                  this.loading['saldar'] = false;
                  this._init.snackbar('success', res['msg'], 'Saldado' );
                  this.saldarDialog.close( true );
                  

                }, err => {
                  this.loading['saldar'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  buildCheckOut(){

    return new Promise ( resolve => {

      let totals = {
        account: this.selectAccount.controls['selectedAccount'].value['operacion'],
        remain: this.sumRemain(),
        totalUsed: this._h.moneyInts( this._h.moneyCents(this.accSaldo) - this._h.moneyCents(this.sumRemain()) ),
        balance: this.remaining,
        items: [],
        master: this.data['master']['masterlocatorid']
      }

      let itms = JSON.parse(JSON.stringify(this.saldables[this.selectAccount.get('selectedAccount').value['moneda']] ?? []))
      for( let i of itms ){
        if( this._h.moneyCents(i['toPay']) > 0 ){
          let paid = this._h.moneyCents(i['montoPagado']) + this._h.moneyCents(i['montoEnValidacion']) + this._h.moneyCents(i['toPay'])
          if( paid < this._h.moneyCents(i['monto']) ){
            i['isParcial'] = 1
            i['isPagoHotel'] = 0
            if( paid > this._h.moneyCents(i['montoParcial']) ){
              i['montoParcial'] = this._h.moneyInts( paid )
            }
          }else{
            i['isParcial'] = 0
            i['isPagoHotel'] = 0
            i['montoParcial'] = this._h.moneyInts( paid )
          }

          i['montoPagado'] = this._h.moneyInts( this._h.moneyCents(i['montoPagado']) )
          i['montoEnValidacion'] = this._h.moneyInts( this._h.moneyCents(i['montoEnValidacion']) )
          i['monto'] = this._h.moneyInts( this._h.moneyCents(i['monto']) )
          i['toPay'] = this._h.moneyInts( this._h.moneyCents(i['toPay']) )
          i['montoParcial'] = this._h.moneyInts( this._h.moneyCents(i['montoParcial']) )
          i['account'] = this.selectAccount.controls['selectedAccount'].value['operacion']
          totals.items.push(i)
        }
      }

      resolve( totals )
    })

  }


  
}
  