import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { ValidateTicketComponent } from 'src/app/components/cotizador/modals/validate-ticket/validate-ticket.component';
import { ApiService, InitService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-xfer-checkout',
  templateUrl: './xfer-checkout.component.html',
  styleUrls: ['./xfer-checkout.component.css']
})
export class XferCheckoutComponent implements AfterViewInit, OnChanges {

  @ViewChild( ValidateTicketComponent ) _validate: ValidateTicketComponent
  @Output() done = new EventEmitter
  @Input() rsvData = {}

  rsvForm: UntypedFormGroup = this.fb.group({ isUsd: [''] })
  namesForm: UntypedFormGroup = this.fb.group({ pax1: ['', Validators.required ] })

  namePattern = "^[A-Za-záéíóúÁÉÍÓÚ]+([\\s]{1}[A-Za-záéíóúÁÉÍÓÚ]+)*$"

  constructor(
    private fb: UntypedFormBuilder,
    private _api: ApiService,
    private _init: InitService,
  ) { 
    
  }

  ngAfterViewInit(): void {
    if( this.rsvData['habSelected'] ){
      this.buildForm( this.rsvData )
    }
    // console.log( this.rsvData )
  }

  ngOnChanges( changes: SimpleChanges ){
    // console.log(changes)
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

    this._validate.createForm( this.rsvData, user );

    let jsobj = JSON.parse(JSON.stringify( tr ))

    if( jsobj['info']['llegada'] ){

      if( jsobj['info']['llegada']['flight'] == null ){
        delete jsobj['info']['llegada']
      }else{
        // console.log(jsobj['info']['llegada']['date'])
        jsobj['info']['llegada']['test']=1
        jsobj['info']['llegada']['date'] = moment( jsobj['info']['llegada']['date'] ).tz('America/Bogota').format('YYYY-MM-DD')
        // console.log(jsobj['info']['llegada']['date'])
      }
    }
    
    if( jsobj['info']['salida'] ){

      if( jsobj['info']['salida']['flight'] == null ){
        delete jsobj['info']['salida']
      }else{
        // console.log(jsobj['info']['salida']['date'])
        jsobj['info']['salida']['test']=1
        jsobj['info']['salida']['date'] = moment( jsobj['info']['salida']['date'] ).tz('America/Bogota').format('YYYY-MM-DD')
        // console.log(jsobj['info']['salida']['date'])
      }

      console.log(jsobj)
    }

    (this.rsvForm.get('data') as UntypedFormGroup).addControl('xfer', this.fb.group({
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
          llegada_date:         [ { value: tr.info['llegada'] ? moment(tr.info['llegada'].date).format('YYYY-MM-DD') : null, disabled: false } ],
          llegada_flight:       [ { value: tr.info['llegada'] ? tr.info['llegada'].flight || '' : '', disabled: false } ],
          llegada_hour:         [ { value: tr.info['llegada'] ? tr.info['llegada'].hour : '', disabled: false } ],
          salida_date:          [ { value: tr.info['salida'] ? moment(tr.info['salida'].date).format('YYYY-MM-DD') : null, disabled: false } ],
          salida_flight:        [ { value: tr.info['salida'] ? tr.info['salida'].flight || '' : '', disabled: false } ],
          salida_hour:          [ { value: tr.info['salida'] ? tr.info['salida'].hour : '', disabled: false } ],
          salida_pickup:        [ { value: tr.info['salida'] ? tr.info['salida'].pickup || '' : '', disabled: false } ],
          transfer_type:        [ { value: tr.info.transfer_type, disabled: false }, Validators.required ],
          user_id:              [ { value: tr.info.user_id, disabled: false }, Validators.required ],
          whatsapp_contact:     [ { value: user['whatsapp'] != '' && user['whatsapp'] != null ? user['whatsapp'] : user['phone'], disabled: false }, [Validators.required] ],
          json_names:           [ { value: '', disabled: false }, Validators.required ],
          json_object:          [ JSON.stringify( jsobj ), Validators.required ]
        }),
        item:       this.fb.group({
          itemType:     [{ value: 11,  disabled: false }, [ Validators.required ] ],
          isQuote:      [{ value: 1,  disabled: false }, [ Validators.required ] ],
          zdTicket:     [{ value: '',  disabled: false } ],
        }),
        monto:    this.fb.group({
          tipoCambio:     [{ value: +(usd ? 1 : ( tr.mxn_rate / tr.usd_rate ) ).toFixed(2),  disabled: false }, [ Validators.required ] ],
          monto:          [{ value: +(usd ? tr.usd_rate : tr.mxn_rate).toFixed(2),  disabled: false }, [ Validators.required ] ],
          montoOriginal:  [{ value: +(usd ? tr.usd_rate : tr.mxn_rate).toFixed(2),  disabled: false }, [ Validators.required ] ],
          montoParcial:   [{ value: +(usd ? tr.usd_rate : tr.mxn_rate).toFixed(2),  disabled: false }, [ Validators.required ] ],
          moneda:         [{ value: usd ? 'USD' : 'MXN',  disabled: false }, [ Validators.required ] ],
          lv:             [{ value: 1,  disabled: false }, [ Validators.required ] ],
          lv_name:        [{ value: 'cc',  disabled: false }, [ Validators.required ] ],
          grupo:          [{ value: sum['grupo'] == 'Cortesia' ? 'ohr' : 'ccenter',  disabled: false }, [ Validators.required ] ],
          promo:          [{ value: 'C',  disabled: false }, [ Validators.required ] ],
        })
      })
    )

    if( sum['grupo'] == 'Cortesia' ){
      (this.rsvForm.get('data.xfer.item') as UntypedFormGroup).addControl('showMontoInConfirm', new UntypedFormControl(0, [Validators.required]))
    }

    this.rsvForm.get('zdTicket').valueChanges.subscribe( x => { 
      this.rsvForm.get('data.xfer.item.zdTicket').setValue(x)
    })

    this.rsvForm.get('data.xfer.xfer.whatsapp_contact').valueChanges.subscribe( r => {
      this.buildComments()
    })

    this.buildNameForm( +(tr.adults) + +(tr.babies) + +(tr.children))

  }

  buildNameForm( p ){
    this.namesForm = this.fb.group({
      comments: [ '' ]
    })

    for( let i = 1; i <= p; i++){
      let dflt = i == 1 ? this.rsvData['formRsv']['zdUser']['name'] : ''
      this.namesForm.addControl(`pasajero_${i}`, new UntypedFormControl(dflt, [Validators.required, Validators.minLength(5)]))
    }

    this.buildComments()

    this.namesForm.valueChanges.subscribe( r => {
     this.buildComments()
    })

  }


  buildComments(){
    let json = JSON.stringify(this.namesForm.value)

    let find = '["\{\}]';
    let re = new RegExp(find, 'g');

    if( this.namesForm.valid ){
      this.rsvForm.get('data.xfer.xfer.json_names').setValue( json )

      if( this.rsvForm.get('data.xfer.xfer.whatsapp_contact').valid ){

        // console.log(this.rsvData['habSelected']['summarySearch'])
        let forcedIn = this.rsvData['habSelected']['summarySearch']['llegada'] && this.rsvData['habSelected']['summarySearch']['llegada']['forced'] ? true : false
        let forcedOut = this.rsvData['habSelected']['summarySearch']['salida'] && this.rsvData['habSelected']['summarySearch']['salida']['forced'] ? true : false

        let fmsg = ''

        if( forcedIn) {
          fmsg += ' ** Vuelo de llegada forzado manualmente, no se encontro en FlightAware ** '
        }

        if( forcedOut ) {
          fmsg += ' ** Vuelo de salida forzado manualmente, no se encontro en FlightAware ** '
        }

        let comments = json.replace(re, ' ') + '// Contacto: ' + this.rsvForm.get('data.xfer.xfer.whatsapp_contact').value + fmsg
        this.rsvForm.get('data.xfer.xfer.comments').setValue( comments )
        this.buildJsonObj( comments )
      }else{
        this.rsvForm.get('data.xfer.xfer.comments').reset()
        this.buildJsonObj( '' )
      }
    }else{
      this.rsvForm.get('data.xfer.xfer.json_names').reset()
      this.rsvForm.get('data.xfer.xfer.comments').reset()
      this.buildJsonObj( '' )
    }

    // console.log( this.rsvForm.get('data.xfer.xfer.comments').value )
  }

  buildJsonObj( c ){
    let trData = JSON.parse(JSON.stringify( this.rsvData['habSelected']['traslado'] ))

    // let jsobj = JSON.parse(JSON.stringify( tr ))

    if( trData['info']['llegada'] ){
      // console.log(jsobj['info']['llegada']['date'])
      trData['info']['llegada']['date'] = moment( trData['info']['llegada']['date'] ).tz('America/Bogota').format('YYYY-MM-DD') + 'T05:03:00.000Z'
      // console.log(jsobj['info']['llegada']['date'])
    }
    
    if( trData['info']['salida'] ){
      // console.log(jsobj['info']['salida']['date'])
      trData['info']['salida']['date'] = moment( trData['info']['salida']['date'] ).tz('America/Bogota').format('YYYY-MM-DD') + 'T05:03:00.000Z'
      // console.log(jsobj['info']['salida']['date'])
    }

    trData['comments'] = c
    this.rsvForm.get('data.xfer.xfer.json_object').setValue( JSON.stringify(trData) )
  }

  getErrorMessage( ctrl, form = this.rsvForm ) {

   
    if (form.get(ctrl).hasError('required')) {
      return 'Este valor es obligatorio';
    }
    
    if (form.get(ctrl).hasError('email')) {
      return 'El valor debe tener formato de email';
    }
    
    if (form.get(ctrl).hasError('minlength')) {
      return 'El nombre escrito es demasiado corto';
    }
    
    if (form.get(ctrl).hasError('min')) {
      return 'El valor debe ser mayor o igual a ' + form.get(ctrl).errors.min.min;
    }
    
    if (form.get(ctrl).hasError('max')) {
      return 'El valor debe ser menor o igual a ' + form.get(ctrl).errors.max.max;
    }
    
    if (form.get(ctrl).hasError('pattern')) {
      return 'Ingresa un numero telefónico válido. puedes iniciar con "+". Recuerda no incluir "espacios" ni "-"';
    }
    
    if (form.get(ctrl).hasError('finMenorIgual')) {
      return 'La fecha final debe ser mayor al inicio';
    }
    
    if (form.get(ctrl).hasError('inicioPasado')) {
      return 'La fecha inicial no puede ser en el pasado';
    }
    
    return 'El campo tiene errores';
  }

  doneEmit(){
    this.done.emit( true )
  }

  


}


