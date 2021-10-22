import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ApiService, InitService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-hotel-checkout',
  templateUrl: './hotel-checkout.component.html',
  styleUrls: ['./hotel-checkout.component.css']
})
export class HotelCheckoutComponent implements OnInit, OnChanges {

  @Input() rsvData = {}

  rsvForm: FormGroup 

  levelSelected = {
    selected: 1,
    data: {}
  }

  levelsData = {}

  levelNames = {
    'publica': 1,
    'silver': 2,
    'gold': 3,
    'platinum': 4,
  }

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
      this.setLevelsData( this.rsvData['habSelected']['hotel']['tarifas'][this.displayDate( this.rsvData['habSelected']['summarySearch']['inicio'], 'YYYY-MM-DD' )] )
      this.chgLevel( this.rsvData['habSelected']['selectedLevel'], this.rsvData['habSelected']['hotel']['tarifas'][ this.displayDate( this.rsvData['habSelected']['summarySearch']['inicio'], 'YYYY-MM-DD' )]['n' + this.rsvData['habSelected']['selectedLevel']] ) 
    }
    console.log( this.rsvData )
  }
  
  ngOnChanges( changes: SimpleChanges ){
    console.log(changes)
    if( changes['rsvData'] && changes['rsvData']['currentValue']['habSelected'] ){

      async () => {
        let curr = changes['rsvData']['currentValue']

        // this.buildForm( curr )
        
        this.levelsData = await this.setLevelsData( this.rsvData['habSelected']['hotel']['tarifas'][this.displayDate( this.rsvData['habSelected']['summarySearch']['inicio'], 'YYYY-MM-DD' )] )
        this.chgLevel( curr['habSelected']['selectedLevel'], this.levelsData['n' + curr['habSelected']['selectedLevel']] ) 
      }

    }

  }

  createForm(){
    let sum = this.rsvData['habSelected']['summarySearch']
    let zd = this.rsvData['formRsv']['zdUser']

    this.rsvForm =  this.fb.group({
      inicio:       [{ value: moment(sum['inicio']).format('YYYY-MM-DD'),   disabled: false }, [ Validators.required ] ],
      fin:          [{ value: moment(sum['fin']).format('YYYY-MM-DD'),      disabled: false }, [ Validators.required ] ],
      habs:         [{ value: sum['habs'],                                  disabled: false }, [ Validators.required ] ],
      grupo:        [{ value: sum['grupo']['grupo'],                        disabled: false }, [ Validators.required ] ],
      nacionalidad: [{ value: this.rsvData['formRsv']['isNacional'] ? 1 : 2,  disabled: false }, [ Validators.required ] ],
      isUSD:        [{ value: sum['isUSD'] ? 'MXN' : 'USD',                 disabled: false }, [ Validators.required ] ],
      hasInsurance: [{ value: this.rsvData['formRsv']['rsvInsurance'],      disabled: false }, [Validators.required ] ],
      habitaciones: this.fb.group({})
    })
  }

  buildForm( curr ){

    let hData = curr['habSelected']
    let hGpo = hData['extraInfo']['grupo']
    let hSum = hData['summarySearch']
    let usd = hSum['isUSD']
    let user = curr['formRsv']['zdUser']
    let split = curr['formRsv']['splitNames']

    this.createForm()

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
          hasTransfer:    [ this.rsvData['habSelected']['hotel']['habs']['hasTransfer'] ? 1 : 0, [ Validators.required ]],
          xldPol:         [ this.rsvData['habSelected']['extraInfo']['grupo']['xldPolicy'], [ Validators.required ]],
          orId:           [ this.rsvData['formRsv']['orId'], [ Validators.required ]],
          orLevel:        [ this.rsvData['formRsv']['orLevel'], [ Validators.required ]],
        }))

    }
    
    for( let i = 1; i <= curr['habSelected']['summarySearch']['habs']; i++ ){
      let pax = curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['adultos'] + curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['menores']

        // BUILD PAX HABITACION
      let adultos = curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['adultos']
      let menores = curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['menores'] > 2 ? 2 : curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['menores']
      let juniors = curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['menores'] > 2 ? 3 - menores : 0

      // BUILD MONTOS HABITACION
      let habMonto = curr['habSelected']['hotel']['habs']['porHabitacion']['hab' + i]

      if( !this.rsvForm.get('habitaciones.hab' + i) ){
        
        (this.rsvForm.get('habitaciones') as FormGroup).addControl('hab' + i, this.fb.group({
          hotel:        this.fb.group({
            item:       this.fb.group({
              itemType:     [{ value: 1,  disabled: false }, [ Validators.required ] ],
              isQuote:      [{ value: 1,  disabled: false }, [ Validators.required ] ],
              zdTicket:     [{ value: curr['formRsv']['ticketRef'],  disabled: false }, [ this._init.checkSingleCredential('rsv_omitTicket') ? Validators.required : null ] ],
            }),
            hotel             : this.fb.group({
              hotel           : [ hData.hotel.hotel, [ Validators.required ] ],
              categoria       : [ hData.hotel.habCode, [ Validators.required ] ],
              mdo             : [ hGpo.mayorista, [ Validators.required ] ],
              agencia         : [ hGpo[(usd ? 'us' : 'mx') + 'Agencia' + (hData.hotel.tarifa_pp == 0 ? 'Ep' : '') + ( hData.hotel.isNR == 1 ? 'NR' : '')], [ Validators.required ] ],
              gpoTfa          : [ hGpo[ usd ? 'cieloUSD' : 'cieloMXN'], [ Validators.required ] ],
              adultos         : [ adultos, [ Validators.required ] ],
              juniors         : [ juniors, [ Validators.required ] ],
              menores         : [ menores, [ Validators.required ] ],
              inicio          : [ moment(hSum['inicio']).format('YYYY-MM-DD'), [ Validators.required ] ],
              fin             : [ moment(hSum['fin']).format('YYYY-MM-DD'), [ Validators.required ] ],
              noches          : [ moment(hSum['fin']).diff(moment(hSum['inicio']), 'days'), [ Validators.required ] ],
              notasHotel      : [ '', [] ],
              isLocal         : [ hGpo.isLocal, [ Validators.required ] ],
              isNR            : [ hData.hotel.isNR, [ Validators.required ] ],
              gpoCC           : [ hGpo.grupo, [ Validators.required ] ],
              bedPreference   : [ '', [ Validators.required ] ],
              titular         : [ user['name'], [ Validators.required ] ],
              htl_nombre_1    : [ split.nombre, [ Validators.required, Validators.pattern( this.namePattern ) ] ],
              htl_apellido_1  : [ split.apellido, [ Validators.required, Validators.pattern( this.namePattern ) ] ]
            })
          }),
          pax:          [adultos + juniors + menores, [ Validators.required ] ]
        }))

        
        for( let x = 2; x <= pax; x++ ){
          (this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel') as FormGroup).addControl('htl_nombre_' + x, new FormControl('', Validators.pattern(this.namePattern)));
          (this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel') as FormGroup).addControl('htl_apellido_' + x, new FormControl('', Validators.pattern(this.namePattern)));
        }
      }

      this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel.htl_nombre_1').valueChanges.subscribe( x => { 
        let name = this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel.htl_nombre_1').value + ' ' + this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel.htl_apellido_1').value
        this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel.titular').setValue( name )
      })

      this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel.htl_apellido_1').valueChanges.subscribe( x => { 
        let name = this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel.htl_nombre_1').value + ' ' + this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel.htl_apellido_1').value
        this.rsvForm.get('habitaciones.hab' + i + '.hotel.hotel.titular').setValue( name )
      })
    }

    // BUILD SEGUROS
    this.buildInsurance( hData, user )
    this.buildMonto( hData )

    console.log( this.rsvForm.value )
  }

  buildMonto( hData = this.rsvData['habSelected'] ){

    let hGpo = hData['extraInfo']['grupo']
    let hSum = hData['summarySearch']
    let curr = this.rsvData
    let usd = hSum['isUSD']

    for( let i = 1; i <= curr['habSelected']['summarySearch']['habs']; i++ ){
      // BUILD MONTOS HABITACION
      let habMonto = curr['habSelected']['hotel']['habs']['porHabitacion']['hab' + i]

      if( this.rsvForm.get('habitaciones.hab' + i + '.hotel.monto') ){
        (this.rsvForm.get('habitaciones.hab' + i + '.hotel') as  FormGroup).removeControl('monto')
      }
  
      (this.rsvForm.get('habitaciones.hab' + i + '.hotel') as FormGroup).addControl('monto', this.fb.group({
        monto:          [{ value: +(habMonto.total['n' + this.levelSelected.selected ].monto * (usd ? 1 : hData.hotel.tipoCambio)).toFixed(2),  disabled: false }, [ Validators.required ] ],
        montoOriginal:  [{ value: +(habMonto.total.neta.monto * (usd ? 1 : hData.hotel.tipoCambio)).toFixed(2),  disabled: false }, [ Validators.required ] ],
        montoParcial:   [{ value: +(habMonto.total['n' + this.levelSelected.selected ].monto * (usd ? 1 : hData.hotel.tipoCambio)).toFixed(2),  disabled: false }, [ Validators.required ] ],
        moneda:         [{ value: usd ? 'USD' : 'MXN',  disabled: false }, [ Validators.required ] ],
        lv:             [{ value: this.levelSelected.selected,  disabled: false }, [ Validators.required ] ],
        lv_name:        [{ value: this.levelSelected.data['code'],  disabled: false }, [ Validators.required ] ],
        grupo:          [{ value: hGpo[ usd ? 'cieloUSD' : 'cieloMXN'],  disabled: false }, [ Validators.required ] ],
        promo:          [{ value: hGpo['p' + this.levelSelected.selected],  disabled: false }, [ Validators.required ] ],
      }))
    }
  }

  buildInsurance(  hData = this.rsvData['habSelected'], user = this.rsvData['formRsv']['zdUser'] ){
    
    let hSum = hData['summarySearch']
    let curr = this.rsvData
    let usd = hSum['isUSD']
    let nacionalidad = user.nacionalidad
    let cobertura = hSum.cobertura

    if( this.rsvForm.get('hasInsurance').value ){

      for( let i = 1; i <= curr['habSelected']['summarySearch']['habs']; i++ ){
        let pax = curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['adultos'] + curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['menores']
  
          // BUILD PAX HABITACION
        let adultos = curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['adultos']
        let menores = curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['menores'] > 2 ? 2 : curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['menores']
        let juniors = curr['habSelected']['summarySearch']['habitaciones']['hab' + i]['menores'] > 2 ? 3 - menores : 0

        // console.log('build Insurance ' + i, this.rsvForm.value)

        let seguro = hData['extraInfo']['seguros']['hab' + i][nacionalidad][cobertura];
        let sg_monto = seguro.publico_ci * (usd ? 1 : seguro.tipoCambio );

        if( this.rsvForm.get('habitaciones.hab' + i + '.insurance') ){
          (this.rsvForm.get('habitaciones.hab' + i) as  FormGroup).removeControl('insurance')
        }

        (this.rsvForm.get('habitaciones.hab' + i) as FormGroup).addControl('insurance', this.fb.group({
          item:       this.fb.group({
            itemType:     [{ value: 10,  disabled: false }, [ Validators.required ] ],
            isQuote:      [{ value: 1,  disabled: false }, [ Validators.required ] ],
            zdTicket:     [{ value: curr['formRsv']['ticketRef'],  disabled: false }, [ this._init.checkSingleCredential('rsv_omitTicket') ? Validators.required : null ] ],
          }),
          monto:      this.fb.group({
            montoOriginal:  [{ value: sg_monto,  disabled: false }, [ Validators.required ] ],
            monto:          [{ value: sg_monto,  disabled: false }, [ Validators.required ] ],
            moneda:         [{ value: usd ? 'USD' : 'MXN',  disabled: false }, [ Validators.required ] ],
            lv:             [{ value: 1,  disabled: false }, [ Validators.required ] ],
            lv_name:        [{ value: 'default',  disabled: false }, [ Validators.required ] ],
            grupo:          [{ value: 'assistCard',  disabled: false }, [ Validators.required ] ],
            promo:          [{ value: 'C',  disabled: false }, [ Validators.required ] ],
            montoParcial:   [{ value: sg_monto,  disabled: false }, [ Validators.required ] ],
          }),
          insurance:  this.fb.group({
            sg_pax:       [{ value: adultos + juniors + menores,  disabled: false }, [ Validators.required ] ],
            sg_hotel:     [{ value: hData.hotel.hotel,  disabled: false }, [ Validators.required ] ],
            sg_inicio:    [{ value: moment(hSum['inicio']).format('YYYY-MM-DD'),  disabled: false }, [ Validators.required ] ],
            sg_fin:       [{ value: moment(hSum['fin']).format('YYYY-MM-DD'),  disabled: false }, [ Validators.required ] ],
            sg_mdo:       [{ value: nacionalidad,  disabled: false }, [ Validators.required ] ],
            sg_cobertura: [{ value: cobertura,  disabled: false }, [ Validators.required ] ],
          }),
        }));

      }

    }
  }

  displayDate( dt, f ){
    return moment(dt).format(f)
  }

  chgLevel( l, d ){
    this.levelSelected['selected'] = l
    this.levelSelected['data'] = d

    this.buildMonto()
  }

  setLevelsData( d ){

    return new Promise(resolve => {
      this.levelsData = {
        'n1': d['n1'],
        'n2': d['n2'],
        'n3': d['n3'],
        'n4': d['n4']
      }

      resolve( true )
    })

  }

  levelCompare( l: string ){

    let orLevel = this.rsvData['formRsv']['orLevel'] != null ? this.rsvData['formRsv']['orLevel'].toLowerCase() : 'publica'

    l = l.toLowerCase()

    return this.levelNames[l] < this.levelNames[orLevel]
  }

  selectBestLevel(){

    let orLevel = this.rsvData['formRsv']['orLevel'] != null ? this.rsvData['formRsv']['orLevel'].toLowerCase() : 'publica'
    let bestLv = this.levelNames[orLevel]
    
    for( let x = bestLv; x > this.levelSelected.selected; x-- ){
      if( this.levelsData['n' + x]['active'] == 1 ){
        this.chgLevel( x, this.levelsData['n' + x])
        return true
      }
    }

    Swal.fire('Error', 'Los niveles con mayor descuento no se encuentran disponibles en este momento. Se ha mantenido el nivel elegido originalmente.', 'error')
  }

  changeCobertura(){
    let ncob = this.rsvData['habSelected']['summarySearch']['cobertura'] == 'normal' ? 'extendida' : 'normal' 

    this.rsvData['habSelected']['summarySearch']['cobertura'] = ncob

    this.buildInsurance()
  }

  getDifCobertura( bool = false){

    let cobNueva = this.rsvData['habSelected']['extraInfo']['seguros']['total']['internacional'][this.rsvData['habSelected']['summarySearch']['cobertura']]['publico_ci']
    let cobActual = this.rsvData['habSelected']['extraInfo']['seguros']['total']['internacional'][ this.rsvData['habSelected']['summarySearch']['cobertura'] == 'normal' ? 'extendida' : 'normal' ]['publico_ci'] 

    let dif = (cobActual - cobNueva) * ( this.rsvData['habSelected']['summarySearch']['isUSD'] ? 1 : this.rsvData['habSelected']['hotel']['tipoCambio'] )

    return bool ? dif >= 0 : dif
  }

  addInsurance(){
    this.rsvData['formRsv']['rsvInsurance'] = true
    this.rsvData['formRsv']['rsvNacional'] = this.rsvData['formRsv']['isNacional']
    this.rsvData['habSelected']['summarySearch']['cobertura'] = 'normal'

    this.buildForm( this.rsvData )
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
