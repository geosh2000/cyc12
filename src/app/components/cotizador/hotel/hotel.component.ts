import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ApiService, InitService } from 'src/app/services/service.index';

import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

import * as moment from 'moment-timezone';
import 'moment/locale/es-mx';
import { OrderPipe } from 'ngx-order-pipe';
import { DomSanitizer } from '@angular/platform-browser';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD-MM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

declare var jQuery: any;

@Component({
  selector: 'cotiza-hotel',
  templateUrl: './hotel.component.html',
  styleUrls: ['./hotel.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class CotizaHotelComponent implements OnInit {

  @Output() rsv = new EventEmitter<any>()
  @Input() data: any;

  loading = {}

  hotelSearch: FormGroup
  summarySearch = {}

  minDate = moment(moment().format('YYYY-MM-DD'))
  maxDate = moment(`${moment().add(1, 'years').format('YYYY')}-12-19`)

  // Catalogs
  grupos = []
  nacionalidad = ['nacional', 'internacional']

  // Flags
  filterExpanded  = true
  showUsd         = false
  noResults       = false

  cotizacion = []
  extraInfo = {}
  selectedLevel = 1

  constructor( 
          private _api: ApiService, 
          public _init: InitService, 
          public dialog: MatDialog,
          private sanitization:DomSanitizer,
          private order: OrderPipe ) { 
      moment.locale('es-mx');

      this.createForm()
    }

  ngOnInit(): void {

    // No Restrict Dates for Supervisors
    if( this._init.checkSingleCredential('app_cotizador_noRestrict') ){
      // this.minDate = moment().subtract(2,'years')
      // this.maxDate = moment().add(2,'years')
    }

    this.getCodes()

    this.summarySearch = this.hotelSearch.value
    
  }

  dateFilter = (d: moment.Moment | null): boolean => {
    const day = (d || moment());

    // Prevent Saturday and Sunday from being selected.
    // return day !== 0 && day !== 6;
    return day > this.minDate
  }

  resetValues(){
    this.hotelSearch.reset({})
    this.createForm()
  }

  createForm(){
    this.hotelSearch =  new FormGroup({
      ['inicio']:       new FormControl({ value: '',  disabled: false }, [ Validators.required ]),
      ['fin']:          new FormControl({ value: '',  disabled: false }, [ Validators.required ]),
      ['habs']:         new FormControl({ value: '',   disabled: false }, [ Validators.required ]),
      ['grupo']:        new FormControl({ value: '',  disabled: false }, [ Validators.required ]),
      ['nacionalidad']: new FormControl({ value: '',  disabled: false }, [ Validators.required ]),
      ['noRestrict']:   new FormControl({ value: false,  disabled: false }, [ Validators.required ]),
      ['isUSD']:        new FormControl({ value: false,  disabled: false }, [ Validators.required ]),
      ['habitaciones']: new FormGroup({})
    })

    this.hotelSearch.controls['habs'].valueChanges.subscribe( x => { 

      this.roomsControls(x)

    })

    this.hotelSearch.controls['habs'].setValue(1)
  }

  roomsControls( x ){

    if( x <= 0 || x > 10 ){
      return false
    }

    for( let i = 1; i <= 10; i++ ){
      if( i > x ){
        if( this.hotelSearch.get('habitaciones.hab' + i) ){
          (this.hotelSearch.get('habitaciones') as FormGroup).removeControl('hab' + i)
        }
      }else{
        if( !this.hotelSearch.get('habitaciones.hab' + i) ){
          (this.hotelSearch.get('habitaciones') as FormGroup).addControl('hab' + i, new FormGroup({
            ['adultos']:    new FormControl({ value: 2, disabled: false }, [ Validators.required ]),
            ['menores']:    new FormControl({ value: 0, disabled: false }, [ Validators.required ]),
            ['edades']:     new FormGroup({
                              ['menor_1']:    new FormControl({ value: 0, disabled: true }, [ Validators.required ]),
                              ['menor_2']:    new FormControl({ value: 0, disabled: true }, [ Validators.required ]),
                              ['menor_3']:    new FormControl({ value: 0, disabled: true }, [ Validators.required ])
                          })
                    }))

            this.hotelSearch.get('habitaciones.hab' + i + '.menores').valueChanges.subscribe( y => {
              if( y < 0 || y > 3 ){
                return false
              }

              for( let z = 1; z <= 3; z++ ){
                let room = 'habitaciones.hab' + i + '.edades.menor_' + z
                if( z > y ){
                  this.hotelSearch.get(room).setValue(0)
                  this.hotelSearch.get(room).disable()
                }else{
                  this.hotelSearch.get(room).enable()
                }
              }
            })
        }
      }
    }



  }

  getCodes() {

    this.loading['grupos'] = true;


    this._api.restfulGet( '', 'Lists/gruposTarifa' )
                .subscribe( res => {

                  this.loading['grupos'] = false;
                  this.grupos = res['data']

                }, err => {
                  this.loading['grupos'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });
  }



  callSnack(){
    this._init.snackbar('success', 'Componene de hotel iniciado', 'Cerrar')
  }

  getErrorMessage( ctrl, form = this.hotelSearch ) {

    if ( this.loading[ctrl] ){
      return 'Cargando ' + ctrl + '...'
    }
    
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
      return 'Formato HH:MM 24hrs';
    }
    
    return 'El campo tiene errores';
  }

  cotizar( f = this.hotelSearch ){

    this.filterExpanded = false
    this.cotizacion = []
    this.extraInfo = {
      'grupo': null,
      'seguros': null
    }
    this.selectedLevel = 1
    
    // VALIDATE DATES

    let inicio = moment(f.get('inicio').value.format('YYYY-MM-DD'))
    let fin = moment(f.get('fin').value.format('YYYY-MM-DD'))

    if( inicio < this.minDate ){
      this._init.snackbar('error', 'No se puede cotizar una fecha en el pasado', 'Cerrar')
      return false
    }

    if( fin.format('YYYY-MM-DD') == inicio.format('YYYY-MM-DD') ){
      this._init.snackbar('error', 'Debes seleccionar màs de 1 noche para cotizar', 'Cerrar')
      return false
    }

    this.getInsurancesQuote(f)

  }

  changeSumNation( v ){
    if( v == 'nacional' ){
      this.summarySearch['cobertura'] = 'normal'
    }

    this.summarySearch['nacionalidad'] = v
  }
  
  getHotelsQuote( f = this.hotelSearch ){

    // GET QUOTATION
    this.loading['cotizar'] = true

    this._api.restfulPut( f.value, 'Venta/cotizaV2' )
                .subscribe( res => {

                  this.loading['cotizar'] = false;
                  this.summarySearch = f.value
                  this.summarySearch['cobertura'] = 'normal'

                  this.extraInfo['grupo'] = res['extra']['grupo']
                  this.extraInfo['grupo']['insuranceIncluded'] = res['extra']['grupo']['insuranceAtFirst'] == '1' && this.summarySearch['nacionalidad'] == 'internacional'

                  let result = res['data']
                  let habDet = this.buildOcc(f.value)

                  for( let i of result ){
                    i['tarifas'] = JSON.parse(i['jsonData']) 
                    i['habs'] = this.habPriceBuild(JSON.parse(JSON.stringify(habDet)),i, f)
                    i['hotelUrl'] = this.sanitization.bypassSecurityTrustStyle(`url(${i['hotelUrl']})`)
                  }

                  console.log(result)
                  console.log(this.extraInfo)
                  this.cotizacion = result
                  
                }, err => {
                  this.loading['cotizar'] = false;

                  this.filterExpanded = true
                  this.cotizacion = []
                  this.extraInfo = {
                    'grupo': null,
                    'seguros': null
                  }

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });

  }

  getInsurancesQuote( f = this.hotelSearch ){

    this.loading['cotizar'] = true

    let params = {
      inicio: f.get('inicio').value.format('YYYY-MM-DD'),
      fin: f.get('fin').value.format('YYYY-MM-DD'),
      habitaciones: f.get('habitaciones').value
    }

    this._api.restfulPut( params, 'Assistcard/multipleQuote' )
                .subscribe( res => {

                  this.extraInfo['seguros'] = res['data']
                  this.getHotelsQuote( f )

                }, err => {
                  this.loading['cotizar'] = false;

                  this.filterExpanded = true
                  this.cotizacion = []
                  this.extraInfo = {
                    'grupo': null,
                    'seguros': null
                  }

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });

  }

  habPriceBuild( b, i, f ){

    let r = i['tarifas']
    let htl = i['hotel']
    let noR = this._init.checkSingleCredential('app_cotizador_allLevels', false, true)
    
    for( let h in b['porHabitacion']){
      for( let f in r ){
        
        let neta = this.getPrice( b['porHabitacion'][h]['occ']['adultos'], b['porHabitacion'][h]['occ']['menores'], r[f]['precio'] )
        
        
        b['porHabitacion'][h]['fechas'][f] = {
          'neta': neta,
          'n1': {'monto': (neta * (1-r[f]['n1']['descuento'])), 'descuento': r[f]['n1']['descuento'], 'relativeDisc': 1 - ((neta * (1-r[f]['n1']['descuento'])) / neta) },
          'n2': {'monto': (neta * (1-r[f]['n2']['descuento'])), 'descuento': r[f]['n2']['descuento'], 'relativeDisc': 1 - ((neta * (1-r[f]['n2']['descuento'])) / (neta * (1-r[f]['n1']['descuento']))) },
          'n3': {'monto': (neta * (1-r[f]['n3']['descuento'])), 'descuento': r[f]['n3']['descuento'], 'relativeDisc': 1 - ((neta * (1-r[f]['n3']['descuento'])) / (neta * (1-r[f]['n1']['descuento']))) },
          'n4': {'monto': (neta * (1-r[f]['n4']['descuento'])), 'descuento': r[f]['n4']['descuento'], 'relativeDisc': 1 - ((neta * (1-r[f]['n4']['descuento'])) / (neta * (1-r[f]['n1']['descuento']))) },
          isClosed: r[f]['isClosed'] == 1
        }

        b['total']['monto']['neta']['monto'] += neta
        b['total']['monto']['n1']['monto'] += (neta * (1-r[f]['n1']['descuento']))
        b['total']['monto']['n2']['monto'] += (neta * (1-r[f]['n2']['descuento']))
        b['total']['monto']['n3']['monto'] += (neta * (1-r[f]['n3']['descuento']))
        b['total']['monto']['n4']['monto'] += (neta * (1-r[f]['n4']['descuento']))
        
        b['total']['monto']['n1']['relativeDisc'] = 1 - (b['total']['monto']['n1']['monto'] / b['total']['monto']['neta']['monto'])
        b['total']['monto']['n2']['relativeDisc'] = 1 - (b['total']['monto']['n2']['monto'] / b['total']['monto']['n1']['monto'])
        b['total']['monto']['n3']['relativeDisc'] = 1 - (b['total']['monto']['n3']['monto'] / b['total']['monto']['n1']['monto'])
        b['total']['monto']['n4']['relativeDisc'] = 1 - (b['total']['monto']['n4']['monto'] / b['total']['monto']['n1']['monto'])

        b['total']['levels']['n1']['active'] = r[f]['n1']['active'] == 0 ? false : b['total']['levels']['n1']['active']
        b['total']['levels']['n2']['active'] = r[f]['n2']['active'] == 0 ? false : b['total']['levels']['n2']['active']
        b['total']['levels']['n3']['active'] = r[f]['n3']['active'] == 0 ? false : b['total']['levels']['n3']['active']
        b['total']['levels']['n4']['active'] = r[f]['n4']['active'] == 0 ? false : b['total']['levels']['n4']['active']
        
        b['total']['levels']['n1']['enabled'] = (r[f]['n1']['allEnabled'] == 1 || noR) == false ? false : b['total']['levels']['n1']['enabled']
        b['total']['levels']['n2']['enabled'] = (r[f]['n2']['allEnabled'] == 1 || noR) == false ? false : b['total']['levels']['n2']['enabled']
        b['total']['levels']['n3']['enabled'] = (r[f]['n3']['allEnabled'] == 1 || noR) == false ? false : b['total']['levels']['n3']['enabled']
        b['total']['levels']['n4']['enabled'] = (r[f]['n4']['allEnabled'] == 1 || noR) == false ? false : b['total']['levels']['n4']['enabled']
        
        b['total']['levels']['noR'] = noR

      }

      if( this.extraInfo['grupo']['freeTransfer'] == '1' && (b['total']['monto']['n1']['monto'] / b['total']['pax'] ) >= this.extraInfo['grupo']['freeTransferMinUsdPP']  && b['total']['pax'] > 1 ){
        b['hasTransfer'] = true
      }

      
      let errors = this.lookForErrors( i, b['porHabitacion'][h], f )

      b['porHabitacion'][h]['errors'] = errors

      if( errors.flag ){
        b['hasErrors'] = true
      }
      
      if( !errors.skippable ){
        b['skippableErrors'] = false
      }
    }

    return b
  }

  lookForErrors( i, b, f ){

    let errors = {
      flag: false,
      skippable: true,
      errors: {}
    }

    // Tarifas no cargadas
    let noches = f.get('fin').value.diff(f.get('inicio').value, 'days')
    let dt = moment(f.get('inicio').value.format('YYYY-MM-DD'))
    let fst = []
    for( let n = 1; n <= noches; n++ ){
      if( !b['fechas'][dt.format('YYYY-MM-DD')] ){
        fst.push(dt.format('DD MMM'))
      }
      dt.add(1, 'days')
    }
    if( fst.length > 0 ){
      errors['sinTarifaFecha'] = fst.join()
      errors.flag = true
      errors.skippable = false
    }

    // MINIMO DE NOCHES
    if( noches < i['minNights'] ){
      errors['minNights'] = i['minNights']
      errors.flag = true
    }

    let occ = b['occ']
    
    // OCUPACION
    if( occ['adultos'] > i['maxAdults'] ){
      errors['errors']['maxAdults'] = `Máximo de adultos (${ i['maxAdults'] }) excedido`
      errors.flag = true
      errors.skippable = false
    }

    if( occ['menores'] > i['maxChild'] ){
      errors['errors']['maxChild'] = `Máximo de menores (${ i['maxChild'] }) excedido`
      errors.flag = true
      errors.skippable = false
    }

    if( (occ['adultos'] + occ['menores']) > i['maxOcc'] ){
      errors['errors']['maxOcc'] = `Máximo de ocupación (${ i['maxOcc'] }) excedida`
      errors.flag = true
      errors.skippable = false
    }

    let dispo = ''
    for( let f in b['fechas'] ){
      
      // DISPO
      if( b['fechas'][f]['isClosed'] ){
        if( dispo == '' ){
          dispo = moment(f).format('DD MMM')
        }else{
          dispo += `, ${moment(f).format('DD MMM')}`
        }
      }

      // TARIFAS
      if( !errors['errors']['maxAdults'] && !errors['errors']['maxChild'] && !errors['errors']['maxOcc'] ){
        if( b['fechas'][f]['neta'] == 0 ){
          errors['errors']['sinTarifaOcc'] = `No existen tarifas cargadas para esta ocupación (${ occ['adultos'] + '.' + occ['menores'] })`
          errors.flag = true
          errors.skippable = false
        }
      }
    
    }

    // DISPO
    if( dispo != '' ){
      errors['dispo'] = dispo
      errors.flag = true
    }


     return errors
  }


  getPrice( a, m, r ){

    let m3 = 0 

    if( a == 1 && m >= 2 ){
      m = (a + m) - 2
      a = 2
    }

    if( m == 3 ){
      m3 = r['paxMenor']
    }

    return r['pax' + a] + m3
  }

  buildOcc( f ){
    console.log(f)

    let result = {
      'porHabitacion' : {},
      'total': {
        monto: {
          neta: {'monto': 0, 'relativeDisc': 0},
          n1: {'monto': 0, 'relativeDisc': 0},
          n2: {'monto': 0, 'relativeDisc': 0},
          n3: {'monto': 0, 'relativeDisc': 0},
          n4: {'monto': 0, 'relativeDisc': 0}
        },
        levels: {
          n1: {'active': true, 'enabled': true},
          n2: {'active': true, 'enabled': true},
          n3: {'active': true, 'enabled': true},
          n4: {'active': true, 'enabled': true}
        },
        adultos: 0,
        menores: 0,
        pax: 0
      },
      'hasErrors': false,
      'skippableErrors': true
    }

    for( let h in f['habitaciones']){
      console.log(f['habitaciones'][h])
      result['porHabitacion'][h] = {
                                    occ: f['habitaciones'][h],
                                    'fechas': {}
                                  }

      result['total']['adultos']  += f['habitaciones'][h]['adultos']
      result['total']['menores']  += f['habitaciones'][h]['menores']
      result['total']['pax']      += (f['habitaciones'][h]['adultos'] + f['habitaciones'][h]['menores'])
    }
    
    return result

  }

  countKeys( o ){
    return Object.keys(o).length
  }

  removeDialog(): void {
    const dialogRef = this.dialog.open(RemoveInsuranceDialog, {
      // width: '250px',
      data: this.extraInfo['grupo']['insuranceIncluded']
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);

      if( typeof result == 'undefined' ){
        this.extraInfo['grupo']['insuranceIncluded'] = true;
      }else{
        this.extraInfo['grupo']['insuranceIncluded'] = result;
      }
    });
  }

  confirmRemoveInsurance(){
    if( this.extraInfo['grupo']['insuranceIncluded'] ){
      this.removeDialog()
    }else{
      this.extraInfo['grupo']['insuranceIncluded'] = true
    }
  }

  removeInsurance(){
    this.extraInfo['grupo']['insuranceIncluded'] = false
    jQuery('#removeInsurance').modal('hide')
  }


}

@Component({
  selector: 'remove-insurance',
  templateUrl: 'remove-insurance.html',
})
export class RemoveInsuranceDialog {

  constructor(
    public dialogRef: MatDialogRef<RemoveInsuranceDialog>,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}


