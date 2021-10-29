import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ValidateTicketComponent } from '../validate-ticket/validate-ticket.component';
import { ApiService, InitService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tour-checkout',
  templateUrl: './tour-checkout.component.html',
  styleUrls: ['./tour-checkout.component.css']
})
export class TourCheckoutComponent implements OnInit, OnChanges {

  @ViewChild( ValidateTicketComponent ) _validate: ValidateTicketComponent

  @Input() rsvData = {}

  rsvForm: FormGroup = this.fb.group({ isUsd: [''] })

  constructor(
    private fb: FormBuilder,
    private _api: ApiService,
    private _init: InitService,
  ) { }

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
    let tr = this.rsvData['habSelected']['tour']
    let usd = sum['isUSD']

    let user = curr['formRsv']['zdUser']
    let split = curr['formRsv']['splitNames']

    this.rsvForm =  this.fb.group({
      isUSD:        [{ value: sum['isUSD'] ? 'MXN' : 'USD',disabled: false }, [ Validators.required ] ],
      tour:         this.fb.group({
        tour:       this.fb.group({
          adults:               [ +(tr.adults), Validators.required ],
          babies:               [ +(tr.babies), Validators.required ],
          children:             [ +(tr.children), Validators.required ],
          adults_reales:        [ +(tr.adults_reales), [ Validators.required ] ],
          children_reales:      [ +(tr.babies_reales), [ Validators.required ] ],
          babies_reales:        [ +(tr.children_reales), [ Validators.required ] ],
          product_type:         [ tr.product_type, [ Validators.required ] ],
          id:                   [ tr.id, [ Validators.required ] ],          
          id_servicio:          [ tr.id_servicio, [ Validators.required ] ],
          tourName:             [ tr.tourName, [ Validators.required ] ],
          date:                 [ tr.date, [ Validators.required ] ],
          pickup:               [ tr.pickup, [ Validators.required ] ],
          time:                 [ tr.time, [ Validators.required ] ],
          usd_rate:             [ tr.usd_rate, [ Validators.required ] ],
          mxn_rate:             [ tr.mxn_rate, [ Validators.required ] ],
          tipo:                 [ tr.tipo, [ Validators.required ] ],
          transporte:           [ tr.transporte, [ Validators.required ] ],
          hotel:                [ tr.hotel ],
          code:                 [ tr.code, [ Validators.required ] ],
          comments:             [ tr.comments ],
          horario:              [ tr.horario, [ Validators.required ] ],
          muelle:               [ tr.muelle, [ Validators.required ] ],
        }),
        item:       this.fb.group({
          itemType:     [{ value: 12,  disabled: false }, [ Validators.required ] ],
          isQuote:      [{ value: 1,  disabled: false }, [ Validators.required ] ],
          zdTicket:     [{ value: '',  disabled: false }, [ Validators.required ] ],
        }),
        monto:    this.fb.group({
          monto:          [{ value: +(usd ? tr.usd_rate : tr.mxn_rate).toFixed(2),  disabled: false }, [ Validators.required ] ],
          montoOriginal:  [{ value: +(usd ? tr.usd_rate : tr.mxn_rate).toFixed(2),  disabled: false }, [ Validators.required ] ],
          montoParcial:   [{ value: +(usd ? tr.usd_rate : tr.mxn_rate).toFixed(2),  disabled: false }, [ Validators.required ] ],
          moneda:         [{ value: usd ? 'USD' : 'MXN',  disabled: false }, [ Validators.required ] ],
          lv:             [{ value: 1,  disabled: false }, [ Validators.required ] ],
          lv_name:        [{ value: 'cc',  disabled: false }, [ Validators.required ] ],
          grupo:          [{ value: 'ccenter',  disabled: false }, [ Validators.required ] ],
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


}
