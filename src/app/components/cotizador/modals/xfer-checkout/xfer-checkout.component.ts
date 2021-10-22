import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ApiService, InitService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-xfer-checkout',
  templateUrl: './xfer-checkout.component.html',
  styleUrls: ['./xfer-checkout.component.css']
})
export class XferCheckoutComponent implements OnInit, OnChanges {

  @Input() rsvData = {}

  rsvForm: FormGroup = this.fb.group({ isUsd: [''] })

  namePattern = "^[A-Za-záéíóúÁÉÍÓÚ]+([\\s]{1}[A-Za-záéíóúÁÉÍÓÚ]+)*$"

  constructor(
    private fb: FormBuilder,
    private _api: ApiService,
    private _init: InitService,
  ) { 
    
  }

  ngOnInit(): void {
    if( this.rsvData['habSelected'] ){
      this.buildForm( this.rsvData )
    }
    console.log( this.rsvData )
  }

  ngOnChanges( changes: SimpleChanges ){
    console.log(changes)
    if( changes['rsvData'] && changes['rsvData']['currentValue']['habSelected'] ){

      async () => {
        let curr = changes['rsvData']['currentValue']
      }

    }
  }

  buildForm( curr ){

    let sum = this.rsvData['habSelected']['summarySearch']
    let tr = this.rsvData['habSelected']['traslado']
    let usd = sum['isUSD']

    let user = curr['formRsv']['zdUser']
    let split = curr['formRsv']['splitNames']

    this.rsvForm =  this.fb.group({
      isUSD:        [{ value: sum['isUSD'] ? 'MXN' : 'USD',                 disabled: false }, [ Validators.required ] ],
      xfer:         this.fb.group({
        xfer:       this.fb.group({
          xfr_id:               [ { value: '', disabled: true }, Validators.required ],
          itemId:               [ { value: '', disabled: true }, Validators.required ],
          adults:               [ { value: +(tr.adults), disabled: false }, Validators.required ],
          babies:               [ { value: +(tr.babies), disabled: false }, Validators.required ],
          children:             [ { value: +(tr.children), disabled: false }, Validators.required ],
          categoria:            [ { value: tr.categoria, disabled: false }, Validators.required ],
          code:                 [ { value: tr.code, disabled: false }, Validators.required ],
          comments:             [ { value: '', disabled: false }, Validators.required ],
          id:                   [ { value: tr.id, disabled: false }, Validators.required ],
          id_temporada:         [ { value: tr.id_temporada, disabled: false }, Validators.required ],
          id_unidad:            [ { value: tr.id_unidad, disabled: false }, Validators.required ],
          mxn_rate:             [ { value: tr.mxn_rate, disabled: false }, Validators.required ],
          mxn_rate_original:    [ { value: tr.mxn_rate_original, disabled: false }, Validators.required ],
          usd_rate:             [ { value: tr.usd_rate, disabled: false }, Validators.required ],
          usd_rate_original:    [ { value: tr.usd_rate_original, disabled: false }, Validators.required ],
          name:                 [ { value: tr.name, disabled: false }, Validators.required ],
          product_type:         [ { value: tr.product_type, disabled: false }, Validators.required ],
          tipoServicio:         [ { value: tr.tipoServicio, disabled: false }, Validators.required ],
          tipoTransportacion:   [ { value: tr.tipoTransportacion, disabled: false }, Validators.required ],
          tourName:             [ { value: tr.tourName, disabled: false }, Validators.required ],
          canal_id:             [ { value: tr.info.canal_id, disabled: false }, Validators.required ],
          category:             [ { value: tr.info.category, disabled: false }, Validators.required ],
          origin:               [ { value: tr.info.origin, disabled: false }, Validators.required ],
          origin_text:          [ { value: sum.origen.name, disabled: false }, Validators.required ],
          destination:          [ { value: tr.info.destination, disabled: false }, Validators.required ],
          destination_text:     [ { value: sum.destino.name, disabled: false }, Validators.required ],
          producto:             [ { value: tr.info.producto, disabled: false }, Validators.required ],
          service_type:         [ { value: tr.info.service_type, disabled: false }, Validators.required ],
          llegada_date:         [ { value: tr.info.llegada ? moment(tr.info.llegada.date).format('YYYY-MM-DD') : '', disabled: false } ],
          llegada_flight:       [ { value: tr.info.llegada ? tr.info.llegada.flight || '' : '', disabled: false } ],
          llegada_hour:         [ { value: tr.info.llegada ? tr.info.llegada.hour : '', disabled: false } ],
          salida_date:          [ { value: tr.info.salida ? moment(tr.info.salida.date).format('YYYY-MM-DD') : '', disabled: false } ],
          salida_flight:        [ { value: tr.info.salida ? tr.info.salida.flight || '' : '', disabled: false } ],
          salida_hour:          [ { value: tr.info.salida ? tr.info.salida.hour : '', disabled: false } ],
          salida_pickup:        [ { value: tr.info.salida ? tr.info.salida.pickup || '' : '', disabled: false } ],
          transfer_type:        [ { value: tr.info.transfer_type, disabled: false }, Validators.required ],
          user_id:              [ { value: tr.info.user_id, disabled: false }, Validators.required ],
        }),
        item:       this.fb.group({
          itemType:     [{ value: 11,  disabled: false }, [ Validators.required ] ],
          isQuote:      [{ value: 1,  disabled: false }, [ Validators.required ] ],
          zdTicket:     [{ value: curr['formRsv']['ticketRef'],  disabled: false }, [ this._init.checkSingleCredential('rsv_omitTicket') ? Validators.required : null ] ],
        }),
        monto:    this.fb.group({
          monto:          [{ value: +(usd ? this.rsvData['habSelected'].traslado.usd_rate : this.rsvData['habSelected'].traslado.mxn_rate).toFixed(2),  disabled: false }, [ Validators.required ] ],
          montoOriginal:  [{ value: +(usd ? this.rsvData['habSelected'].traslado.usd_rate : this.rsvData['habSelected'].traslado.mxn_rate).toFixed(2),  disabled: false }, [ Validators.required ] ],
          montoParcial:   [{ value: +(usd ? this.rsvData['habSelected'].traslado.usd_rate : this.rsvData['habSelected'].traslado.mxn_rate).toFixed(2),  disabled: false }, [ Validators.required ] ],
          moneda:         [{ value: usd ? 'USD' : 'MXN',  disabled: false }, [ Validators.required ] ],
          lv:             [{ value: 1,  disabled: false }, [ Validators.required ] ],
          lv_name:        [{ value: 'cc',  disabled: false }, [ Validators.required ] ],
          grupo:          [{ value: sum['grupo'] == 'Cortesia' ? 'ohr' : 'ccenter',  disabled: false }, [ Validators.required ] ],
          promo:          [{ value: 'C',  disabled: false }, [ Validators.required ] ],
        })
      })
    })

    if( !this.rsvData['formRsv']['isNew'] ){
      if( this.rsvForm.get('masterdata') ){
        this.rsvForm.removeControl('masterdata')
      }

      this.rsvForm.addControl('masterdata', this.fb.group({
          nombreCliente:  [ user.name, [ Validators.required ]],
          telCliente:     [ user.phone, [ Validators.required ]],
          celCliente:     [ '' ],
          waCliente:      [ user.whatsapp, [ Validators.required ]],
          correoCliente:  [ user.email, [ Validators.required ]],
          zdUserId:       [ user.zdId, [ Validators.required ]],
          esNacional:     [ user.nacionalidad == 'nacional' ? 1 : 2, [ Validators.required ]],
          languaje:       [ user.idioma_cliente, [ Validators.required ]],
          hasTransfer:    [ 0, [ Validators.required ]],
          orId:           [ this.rsvData['formRsv']['orId'], [ Validators.required ]],
          orLevel:        [ this.rsvData['formRsv']['orLevel'], [ Validators.required ]],
        }))

    }
  }

  submitRsv(){
    console.log(this.rsvForm.valid, this.rsvForm)
    console.log(this.rsvForm.value)
  }

  getErrorMessage( ctrl, form = this.rsvForm ) {

   
    if (form.get(ctrl).hasError('required')) {
      return 'Este valor es obligatorio';
    }
    
    if (form.get(ctrl).hasError('email')) {
      return 'El valor debe tener formato de email';
    }
    
    if (form.get(ctrl).hasError('min')) {
      return 'El valor debe ser mayor o igual a ' + form.get(ctrl).errors.min.min;
    }
    
    if (form.get(ctrl).hasError('max')) {
      return 'El valor debe ser menor o igual a ' + form.get(ctrl).errors.max.max;
    }
    
    if (form.get(ctrl).hasError('pattern')) {
      return 'Solo letras. No "ñ" ni apóstrofes. Revisa los espacios al inicio y al final';
    }
    
    if (form.get(ctrl).hasError('finMenorIgual')) {
      return 'La fecha final debe ser mayor al inicio';
    }
    
    if (form.get(ctrl).hasError('inicioPasado')) {
      return 'La fecha inicial no puede ser en el pasado';
    }
    
    return 'El campo tiene errores';
  }

  digControls( c, err, n = '' ){
    // console.log('run dig')
    let arr = []
    if( c['controls'] ){
      for( let ct in c['controls'] ){
        if( c['controls'][ct].status == 'INVALID' ){
          arr.push({ctrl: ct, 'data': this.digControls( c['controls'][ct], err, n + '/' + ct )}) 
        }
      }
    }else{
      if( c.status == 'INVALID' ){
        // console.log(n, c )
        let error = {ctrl: n, 'errores': c.errors }
        arr.push( error ) 
        err.push( error )
      }
    }

    return arr
  }

  viewErrors(){

    let errors = []
    let ctrl = this.rsvForm
    let html = ""

    this.digControls( ctrl, errors )

    for( let err of errors ){
      html += `<b>${ err.ctrl }:</b><pre>${ JSON.stringify( err.errores ) }</pre><br>`
    }

    // console.log( errors )

    Swal.fire({
      title: `<strong>Errores en la información establecida</strong>`,
      icon: 'error',
      html: `<div style='max-height: 60vh; overflow: auto'><code>${ html }</code></div>`,
      focusConfirm: true,
      confirmButtonText: 'Aceptar'
    })
  }

}
