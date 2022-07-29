import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { ApiService, InitService } from 'src/app/services/service.index';

import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

import * as moment from 'moment-timezone';
import 'moment/locale/es-mx';
import { OrderPipe } from 'ngx-order-pipe';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { PackageBuilderComponent } from './package-builder/package-builder.component';

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

  @ViewChild( PackageBuilderComponent, { static: false } ) pkg: PackageBuilderComponent;
  
  @Output() rsv = new EventEmitter<any>()
  @Input() data: any;

  loading = {}

  hotelSearch: UntypedFormGroup
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
          private fb: UntypedFormBuilder,
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
    // this.testCot()
    
  }

  dateFilter = (d: moment.Moment | null): boolean => {
    const day = (d || moment());

    // Prevent Saturday and Sunday from being selected.
    // return day !== 0 && day !== 6;
    return day > this.minDate
  }

  dateValidation( a: string, b: string ){
    return ( formGroup: UntypedFormGroup ) => {

      const inicio = formGroup.get(a)
      const fin = formGroup.get(b)

      if( inicio.value < fin.value ){
        fin.setErrors(null)
      }else{
        fin.setErrors({ finMenorIgual: true })
      }

      if( inicio.value < moment(moment().format('YYYY-MM-DD')) && !formGroup.get('noRestrict').value ){
        inicio.setErrors({ inicioPasado: true })
      }
    }
  }

  resetValues(){
    this.hotelSearch.reset({})
    this.createForm()
  }

  createForm(){
    this.hotelSearch =  this.fb.group({
      inicio:       [{ value: '',  disabled: false }, [ Validators.required ] ],
      fin:          [{ value: '',  disabled: false }, [ Validators.required ] ],
      habs:         [{ value: '',   disabled: false }, [ Validators.required ] ],
      grupo:        [{ value: '',  disabled: false }, [ Validators.required ] ],
      nacionalidad: [{ value: '',  disabled: false }, [ Validators.required ] ],
      noRestrict:   [{ value: false,  disabled: false }, [ Validators.required ] ],
      isUSD:        [{ value: false,  disabled: false }, [ Validators.required ] ],
      bwDate:       [{ value: false,  disabled: true }, [] ],
      habitaciones: this.fb.group({})
    },{
      validators: this.dateValidation('inicio', 'fin')
    })

    this.hotelSearch.controls['habs'].valueChanges.subscribe( x => { 

      this.roomsControls(x)

    })

    
    this.hotelSearch.get('noRestrict').valueChanges.subscribe( x => { 
      if( x ){
        this.hotelSearch.get('bwDate').enable()
      }else{
        this.hotelSearch.get('bwDate').disable()
        this.hotelSearch.get('bwDate').reset()
      }
      
    })
    
    this.hotelSearch.get('isUSD').valueChanges.subscribe( x => { 
      this.summarySearch['isUSD'] = x
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
          (this.hotelSearch.get('habitaciones') as UntypedFormGroup).removeControl('hab' + i)
        }
      }else{
        if( !this.hotelSearch.get('habitaciones.hab' + i) ){
          (this.hotelSearch.get('habitaciones') as UntypedFormGroup).addControl('hab' + i, new UntypedFormGroup({
            ['adultos']:    new UntypedFormControl({ value: 2, disabled: false }, [ Validators.required ]),
            ['menores']:    new UntypedFormControl({ value: 0, disabled: false }, [ Validators.required ]),
            ['edades']:     new UntypedFormGroup({
                              ['menor_1']:    new UntypedFormControl({ value: 0, disabled: true }, [ Validators.required ]),
                              ['menor_2']:    new UntypedFormControl({ value: 0, disabled: true }, [ Validators.required ]),
                              ['menor_3']:    new UntypedFormControl({ value: 0, disabled: true }, [ Validators.required ])
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
    
    if (form.get(ctrl).hasError('finMenorIgual')) {
      return 'La fecha final debe ser mayor al inicio';
    }
    
    if (form.get(ctrl).hasError('inicioPasado')) {
      return 'La fecha inicial no puede ser en el pasado';
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
                .subscribe( async res => {

                  this.loading['cotizar'] = false;
                  this.summarySearch = f.value
                  this.summarySearch['cobertura'] = 'normal'

                  this.extraInfo['grupo'] = res['extra']['grupo']
                  this.extraInfo['grupo']['insuranceIncluded'] = res['extra']['grupo']['insuranceAtFirst'] == '1' && this.summarySearch['nacionalidad'] == 'internacional' && this.extraInfo['grupo']['hasPaq'] == 0

                  this.selectedLevel = res['extra']['grupo']['defaultLevel']
                  let result = res['data']
                  let habDet = this.buildOcc(f.value)

                  for( let i of result ){
                    i['tarifas'] = JSON.parse(i['jsonData']) 
                    i['habs'] = await this.habPriceBuild(JSON.parse(JSON.stringify(habDet)),i, f, i['tipoCambio'])

                    let totalPaq = [0,0]
                    let totalIns = [0,0]
                    let totalDif = [0,0]

                    for( let h in i['habs']['porHabitacion'] ){
                      i['habs']['porHabitacion'][h]['paq'] = this.paqWInc( i['habs']['porHabitacion'][h], i['tipoCambio'], h )
                      totalPaq[0] += parseFloat(i['habs']['porHabitacion'][h]['paq']['paqueteMXN']['montoPaq'])
                      totalPaq[1] += parseFloat(i['habs']['porHabitacion'][h]['paq']['paqueteUSD']['montoPaq'])
                      totalIns[0] += parseFloat(i['habs']['porHabitacion'][h]['paq']['paqueteMXN']['seguro'])
                      totalIns[1] += parseFloat(i['habs']['porHabitacion'][h]['paq']['paqueteUSD']['seguro'])
                      totalDif[0] += parseFloat(i['habs']['porHabitacion'][h]['paq']['paqueteMXN']['montoPaq']) - parseFloat(i['habs']['porHabitacion'][h]['paq']['paqueteMXN']['montoMinimo'])
                      totalDif[1] += parseFloat(i['habs']['porHabitacion'][h]['paq']['paqueteUSD']['montoPaq']) - parseFloat(i['habs']['porHabitacion'][h]['paq']['paqueteUSD']['montoMinimo'])
                    }

                    i['habs']['totalPaqs'] = {
                        mxn: {
                          totalPaq: totalPaq[0].toFixed(2),
                          totalIns: totalIns[0].toFixed(2),
                          totalDif: totalDif[0].toFixed(2)
                        },
                        usd: {
                          totalPaq: totalPaq[1].toFixed(2),
                          totalIns: totalIns[1].toFixed(2),
                          totalDif: totalDif[1].toFixed(2)
                        }                      
                    }

                    i['hotelUrl'] = this.sanitization.bypassSecurityTrustStyle(`url(${i['hotelUrl']})`)
                    
                    // TOTALIZA DIFERENCIAS PAQUETES
                    if( res['extra']['grupo']['insuranceAtFirst'] == '1' ){
                      // for( let h of i['habs'] ){
                      //   if( i['totalDif'] ){
                      //       i['totalDif']['l1'] += parseFloat(h['total']['pqLevel_1']['dif'])
                      //       i['totalDif']['l2'] += parseFloat(h['total']['pqLevel_2']['dif']) 
                      //       i['totalDif']['l3'] += parseFloat(h['total']['pqLevel_3']['dif'])
                      //       i['totalDif']['l4'] += parseFloat(h['total']['pqLevel_4']['dif'])
                      //       i['totalDif']['l5'] += parseFloat(h['total']['pqLevel_5']['dif'])
                      //   }else{
                      //     i['totalDif'] = {
                      //       l1:  parseFloat(h['total']['pqLevel_1']['dif']),
                      //       l2:  parseFloat(h['total']['pqLevel_2']['dif']), 
                      //       l3:  parseFloat(h['total']['pqLevel_3']['dif']),
                      //       l4:  parseFloat(h['total']['pqLevel_4']['dif']),
                      //       l5:  parseFloat(h['total']['pqLevel_5']['dif']),
                      //     }
                      //   }
                      // }
                    }
                  }

                  

                  // console.log(result)
                  // console.log(this.extraInfo)
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

  testCot(){
    let data = this.testData();
    this.extraInfo['seguros'] = data['ins']

    this.summarySearch = data['f']
    this.summarySearch['cobertura'] = 'normal'

    this.extraInfo['grupo'] = data['hot']['extra']['grupo']
    this.extraInfo['grupo']['insuranceIncluded'] = data['hot']['extra']['grupo']['insuranceAtFirst'] == '1' && this.summarySearch['nacionalidad'] == 'internacional' && this.extraInfo['grupo']['hasPaq'] == 0

    this.selectedLevel = parseInt(data['hot']['extra']['grupo']['defaultLevel'])
    let result = data['hot']['data']
    let habDet = this.buildOcc(data['f'])

    for( let i of result ){
      i['tarifas'] = JSON.parse(i['jsonData']) 
      i['habs'] = this.habPriceBuild(JSON.parse(JSON.stringify(habDet)),i, this.hotelSearch, true)
      i['hotelUrl'] = ''

      
      // i['hotelUrl'] = this.sanitization.bypassSecurityTrustStyle(`url(${i['hotelUrl']})`)
    }


    console.log(result)
    // console.log(this.extraInfo)
    this.cotizacion = result

  }

  getGenericXfer( f = this.hotelSearch ){
    this.loading['cotizar'] = true

    let params = {
      inicio: f.get('inicio').value.format('YYYY-MM-DD'),
      fin: f.get('fin').value.format('YYYY-MM-DD'),
      habitaciones: f.get('habitaciones').value
    }

    this._api.restfulPut( params, 'Cmaya/genericXferQuote' )
                .subscribe( res => {

                  this.extraInfo['xfer'] = res['data']
                  this.getHotelsQuote( f )

                }, err => {
                  this.loading['cotizar'] = false;

                  this.filterExpanded = true
                  this.cotizacion = []
                  this.extraInfo = {
                    'grupo': null,
                    'seguros': null,
                    'xfer': null
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
                  this.getGenericXfer( f )

                }, err => {
                  this.loading['cotizar'] = false;

                  this.filterExpanded = true
                  this.cotizacion = []
                  this.extraInfo = {
                    'grupo': null,
                    'xfer': null,
                    'seguros': null
                  }

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });

  }

  habPriceBuild( b, i, f, tc, test = false ){

    return new Promise(resolve => {
    
      let r = i['tarifas']
      let htl = i['hotel']
      let noR = this._init.checkSingleCredential('app_cotizador_allLevels')
      
      for( let h in b['porHabitacion']){
        
        for( let f in r ){
          
          let neta = this.getPrice( b['porHabitacion'][h]['occ']['adultos'], b['porHabitacion'][h]['occ']['menores'], r[f]['precio'] )
          let neta_m = this.getPrice( b['porHabitacion'][h]['occ']['adultos'], b['porHabitacion'][h]['occ']['menores'], r[f]['precio_m'] )
          
          
          b['porHabitacion'][h]['fechas'][f] = {
            'neta': neta,
            'n1': {'monto_m': (neta_m * (1-r[f]['n1']['descuento'])), 'monto': (neta * (1-r[f]['n1']['descuento'])), 'descuento': r[f]['n1']['descuento'], 'relativeDisc': 1 - ((neta * (1-r[f]['n1']['descuento'])) / neta) },
            'n2': {'monto_m': (neta_m * (1-r[f]['n2']['descuento'])), 'monto': (neta * (1-r[f]['n2']['descuento'])), 'descuento': r[f]['n2']['descuento'], 'relativeDisc': 1 - ((neta * (1-r[f]['n2']['descuento'])) / (neta * (1-r[f]['n1']['descuento']))) },
            'n3': {'monto_m': (neta_m * (1-r[f]['n3']['descuento'])), 'monto': (neta * (1-r[f]['n3']['descuento'])), 'descuento': r[f]['n3']['descuento'], 'relativeDisc': 1 - ((neta * (1-r[f]['n3']['descuento'])) / (neta * (1-r[f]['n1']['descuento']))) },
            'n4': {'monto_m': (neta_m * (1-r[f]['n4']['descuento'])), 'monto': (neta * (1-r[f]['n4']['descuento'])), 'descuento': r[f]['n4']['descuento'], 'relativeDisc': 1 - ((neta * (1-r[f]['n4']['descuento'])) / (neta * (1-r[f]['n1']['descuento']))) },
            'n5': {'monto_m': (neta_m * (1-r[f]['n5']['descuento'])), 'monto': (neta * (1-r[f]['n5']['descuento'])), 'descuento': r[f]['n5']['descuento'], 'relativeDisc': 1 - ((neta * (1-r[f]['n5']['descuento'])) / (neta * (1-r[f]['n1']['descuento']))) },
            isClosed: r[f]['isClosed'] == 1
          }
          
          // HAB TOTAL
          b['porHabitacion'][h]['total']['neta']['monto'] += neta
          b['porHabitacion'][h]['total']['n1']['monto'] += (neta * (1-r[f]['n1']['descuento']))
          b['porHabitacion'][h]['total']['n2']['monto'] += (neta * (1-r[f]['n2']['descuento']))
          b['porHabitacion'][h]['total']['n3']['monto'] += (neta * (1-r[f]['n3']['descuento']))
          b['porHabitacion'][h]['total']['n4']['monto'] += (neta * (1-r[f]['n4']['descuento']))
          b['porHabitacion'][h]['total']['n5']['monto'] += (neta * (1-r[f]['n5']['descuento']))
          
          b['porHabitacion'][h]['total']['n1']['relativeDisc'] = 1 - (b['total']['monto']['n1']['monto'] / b['total']['monto']['neta']['monto'])
          b['porHabitacion'][h]['total']['n2']['relativeDisc'] = 1 - (b['total']['monto']['n2']['monto'] / b['total']['monto']['n1']['monto'])
          b['porHabitacion'][h]['total']['n3']['relativeDisc'] = 1 - (b['total']['monto']['n3']['monto'] / b['total']['monto']['n1']['monto'])
          b['porHabitacion'][h]['total']['n4']['relativeDisc'] = 1 - (b['total']['monto']['n4']['monto'] / b['total']['monto']['n1']['monto'])
          b['porHabitacion'][h]['total']['n5']['relativeDisc'] = 1 - (b['total']['monto']['n5']['monto'] / b['total']['monto']['n1']['monto'])

          // TOTALES GENERALES
          b['total']['monto']['neta']['monto'] += neta
          b['total']['monto']['n1']['monto'] += (neta * (1-r[f]['n1']['descuento']))
          b['total']['monto']['n2']['monto'] += (neta * (1-r[f]['n2']['descuento']))
          b['total']['monto']['n3']['monto'] += (neta * (1-r[f]['n3']['descuento']))
          b['total']['monto']['n4']['monto'] += (neta * (1-r[f]['n4']['descuento']))
          b['total']['monto']['n5']['monto'] += (neta * (1-r[f]['n5']['descuento']))
          
          b['total']['monto']['n1']['relativeDisc'] = 1 - (b['total']['monto']['n1']['monto'] / b['total']['monto']['neta']['monto'])
          b['total']['monto']['n2']['relativeDisc'] = 1 - (b['total']['monto']['n2']['monto'] / b['total']['monto']['n1']['monto'])
          b['total']['monto']['n3']['relativeDisc'] = 1 - (b['total']['monto']['n3']['monto'] / b['total']['monto']['n1']['monto'])
          b['total']['monto']['n4']['relativeDisc'] = 1 - (b['total']['monto']['n4']['monto'] / b['total']['monto']['n1']['monto'])
          b['total']['monto']['n5']['relativeDisc'] = 1 - (b['total']['monto']['n5']['monto'] / b['total']['monto']['n1']['monto'])
          
          // FIXED MXN START
          // HAB TOTAL
          b['porHabitacion'][h]['total']['neta']['monto_m'] += neta_m
          b['porHabitacion'][h]['total']['n1']['monto_m'] += (neta_m * (1-r[f]['n1']['descuento']))
          b['porHabitacion'][h]['total']['n2']['monto_m'] += (neta_m * (1-r[f]['n2']['descuento']))
          b['porHabitacion'][h]['total']['n3']['monto_m'] += (neta_m * (1-r[f]['n3']['descuento']))
          b['porHabitacion'][h]['total']['n4']['monto_m'] += (neta_m * (1-r[f]['n4']['descuento']))
          b['porHabitacion'][h]['total']['n5']['monto_m'] += (neta_m * (1-r[f]['n5']['descuento']))
          
                                          
          // TOTALES GENERALES
          b['total']['monto']['neta']['monto_m'] += neta_m
          b['total']['monto']['n1']['monto_m'] += (neta_m * (1-r[f]['n1']['descuento']))
          b['total']['monto']['n2']['monto_m'] += (neta_m * (1-r[f]['n2']['descuento']))
          b['total']['monto']['n3']['monto_m'] += (neta_m * (1-r[f]['n3']['descuento']))
          b['total']['monto']['n4']['monto_m'] += (neta_m * (1-r[f]['n4']['descuento']))
          b['total']['monto']['n5']['monto_m'] += (neta_m * (1-r[f]['n5']['descuento']))
          
          // FIXED MXN END

          b['total']['levels']['n1']['active'] = r[f]['n1']['active'] == 0 ? false : b['total']['levels']['n1']['active']
          b['total']['levels']['n2']['active'] = r[f]['n2']['active'] == 0 ? false : b['total']['levels']['n2']['active']
          b['total']['levels']['n3']['active'] = r[f]['n3']['active'] == 0 ? false : b['total']['levels']['n3']['active']
          b['total']['levels']['n4']['active'] = r[f]['n4']['active'] == 0 ? false : b['total']['levels']['n4']['active']
          b['total']['levels']['n5']['active'] = r[f]['n5']['active'] == 0 ? false : b['total']['levels']['n5']['active']
          
          b['total']['levels']['n1']['enabled'] = (r[f]['n1']['allEnabled'] == 1 || noR) == false ? false : b['total']['levels']['n1']['enabled']
          b['total']['levels']['n2']['enabled'] = (r[f]['n2']['allEnabled'] == 1 || noR) == false ? false : b['total']['levels']['n2']['enabled']
          b['total']['levels']['n3']['enabled'] = (r[f]['n3']['allEnabled'] == 1 || noR) == false ? false : b['total']['levels']['n3']['enabled']
          b['total']['levels']['n4']['enabled'] = (r[f]['n4']['allEnabled'] == 1 || noR) == false ? false : b['total']['levels']['n4']['enabled']
          b['total']['levels']['n5']['enabled'] = (r[f]['n5']['allEnabled'] == 1 || noR) == false ? false : b['total']['levels']['n5']['enabled']
          
          b['total']['levels']['noR'] = noR

        }

        // insurance package build
        for( let l = 1; l <= 5; l++ ){
          b['porHabitacion'][h]['total']['pqLevel_' + l] = {
            level : this.pkg.defInsPaq( b['porHabitacion'][h], l, 'level', tc, this.hotelSearch.get('isUSD').value, this.extraInfo['grupo'] ),
            rate  : this.pkg.defInsPaq( b['porHabitacion'][h], l, 'rate', tc, this.hotelSearch.get('isUSD').value, this.extraInfo['grupo'] ),
            pax : this.pkg.defInsPaq( b['porHabitacion'][h], l, 'pax', tc, this.hotelSearch.get('isUSD').value, this.extraInfo['grupo'] ),
            total : this.pkg.defInsPaq( b['porHabitacion'][h], l, 'total', tc, this.hotelSearch.get('isUSD').value, this.extraInfo['grupo'] ),
            dif : this.pkg.defInsPaq( b['porHabitacion'][h], l, 'dif', tc, this.hotelSearch.get('isUSD').value, this.extraInfo['grupo'] ),
            cRate : this.pkg.defInsPaq( b['porHabitacion'][h], l, 'cRate', tc, this.hotelSearch.get('isUSD').value, this.extraInfo['grupo'] ),
          }
        }

        if( b['totalDif'] ){
            b['totalDif']['l1'] += parseFloat(b['porHabitacion'][h]['total']['pqLevel_1']['dif'])
            b['totalDif']['l2'] += parseFloat(b['porHabitacion'][h]['total']['pqLevel_2']['dif']) 
            b['totalDif']['l3'] += parseFloat(b['porHabitacion'][h]['total']['pqLevel_3']['dif'])
            b['totalDif']['l4'] += parseFloat(b['porHabitacion'][h]['total']['pqLevel_4']['dif'])
            b['totalDif']['l5'] += parseFloat(b['porHabitacion'][h]['total']['pqLevel_5']['dif'])
        }else{
          b['totalDif'] = {
            l1:  parseFloat(b['porHabitacion'][h]['total']['pqLevel_1']['dif']),
            l2:  parseFloat(b['porHabitacion'][h]['total']['pqLevel_2']['dif']), 
            l3:  parseFloat(b['porHabitacion'][h]['total']['pqLevel_3']['dif']),
            l4:  parseFloat(b['porHabitacion'][h]['total']['pqLevel_4']['dif']),
            l5:  parseFloat(b['porHabitacion'][h]['total']['pqLevel_5']['dif']),
          }
        }

        if( this.extraInfo['grupo']['freeTransfer'] == '1' && (b['total']['monto']['n1']['monto'] / b['total']['adultos'] ) >= this.extraInfo['grupo']['freeTransferMinUsdPP']  && b['total']['adultos'] > 1 ){
          b['hasTransfer'] = false
        }

        let errors = this.lookForErrors( i, b['porHabitacion'][h], f, test )

        b['porHabitacion'][h]['errors'] = errors

        if( errors.flag ){
          b['hasErrors'] = true
        }
        
        if( !errors.skippable ){
          b['skippableErrors'] = false
        }

        
      }

      resolve(b)
    })
  }

  lookForErrors( i, b, f, test ){

    let errors = {
      flag: false,
      skippable: true,
      errors: {}
    }

    if( test ){
      return errors
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


  getPrice( a, m, r, mxn = false ){

    let sfx = mxn ? '_m' : ''
    let m3 = 0 

    if( a == 1 && m >= 2 ){
      m = (a + m) - 2
      a = 2
    }

    if( m == 3 ){
      m3 = r['paxMenor' + sfx]
    }

    return r['pax' + a + sfx] + m3
  }

  buildOcc( f ){
    // console.log(f)

    let result = {
      'porHabitacion' : {},
      'total': {
        monto: {
          neta: {'monto_m': 0, 'monto': 0, 'relativeDisc': 0},
          n1: {'monto_m': 0, 'monto': 0, 'relativeDisc': 0},
          n2: {'monto_m': 0, 'monto': 0, 'relativeDisc': 0},
          n3: {'monto_m': 0, 'monto': 0, 'relativeDisc': 0},
          n4: {'monto_m': 0, 'monto': 0, 'relativeDisc': 0},
          n5: {'monto_m': 0, 'monto': 0, 'relativeDisc': 0}
        },
        levels: {
          n1: {'active': true, 'enabled': true},
          n2: {'active': true, 'enabled': true},
          n3: {'active': true, 'enabled': true},
          n4: {'active': true, 'enabled': true},
          n5: {'active': true, 'enabled': true}
        },
        adultos: 0,
        menores: 0,
        pax: 0
      },
      'hasErrors': false,
      'skippableErrors': true
    }

    for( let h in f['habitaciones']){
      // console.log(f['habitaciones'][h])
      result['porHabitacion'][h] = {
                                    occ: f['habitaciones'][h],
                                    'fechas': {},
                                    'total': {
                                      neta: {'monto_m': 0, 'monto': 0, 'relativeDisc': 0},
                                      n1: {'monto_m': 0, 'monto': 0, 'relativeDisc': 0},
                                      n2: {'monto_m': 0, 'monto': 0, 'relativeDisc': 0},
                                      n3: {'monto_m': 0, 'monto': 0, 'relativeDisc': 0},
                                      n4: {'monto_m': 0, 'monto': 0, 'relativeDisc': 0},
                                      n5: {'monto_m': 0, 'monto': 0, 'relativeDisc': 0}
                                    }
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
      // console.log('The dialog was closed', result);

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
  }

  doRsv( r = {}, over = false ){

    // over en true es para paquetes
    let selectedLevel = over ? (this.extraInfo['grupo']['insuranceIncludedPaq'] == '1' ? 2 : this.selectedLevel) : this.selectedLevel
    let usd = this.hotelSearch.get('isUSD').value
    
    if( this.extraInfo['grupo']['insuranceIncludedPaq'] == '1' && selectedLevel != 4){
      for( let h in r['habs']['porHabitacion'] ){
        let hab = r['habs']['porHabitacion'][h]
        hab['insPaq'] = this.pkg.defInsPaq( hab, selectedLevel, 'array', r['tipoCambio'], usd, this.extraInfo['grupo'] )
        hab['insPaq']['importeManual'] = hab['paq'][usd ? 'paqueteUSD' : 'paqueteMXN']['montoManual'] != hab['paq'][usd ? 'paqueteUSD' : 'paqueteMXN']['montoHotel']

        if( over ){
          hab['insPaq']['hotelRate'] = hab['paq'][usd ? 'paqueteUSD' : 'paqueteMXN']['montoManual']
        }
      }
    }

    let ss = JSON.parse(JSON.stringify(this.summarySearch))
    let ei = JSON.parse(JSON.stringify(this.extraInfo))
    
    if( over ){
      ss['isPaq'] = true
      ss['paqXfer'] = false
      ei['grupo']['insuranceIncluded'] = true
    }

    let data = {
      hotel: r,
      level: selectedLevel,
      extraInfo: ei,
      summarySearch: ss,
      selectedLevel: selectedLevel,
      type: 'hotel'
    }


    console.log( r, data )
    // pkg.defInsPaq( c['habs']['porHabitacion'][hab], selectedLevel, 'pax' )

    data = JSON.parse(JSON.stringify(data))
    this.rsv.emit({ action: 'doRsv', data })
  }

  rsvPaq( r = {} ){

    let htl = JSON.parse(JSON.stringify(r))
    let ss = JSON.parse(JSON.stringify(this.summarySearch))
    let ei = JSON.parse(JSON.stringify(this.extraInfo))
    
    ss['isPaq'] = true
    ss['paqXfer'] = this.extraInfo['grupo']['freeTransfer'] == '1' && (r['habs']['total']['monto']['n1']['monto'] / r['habs']['total']['adultos'] ) >= this.extraInfo['grupo']['freeTransferMinUsdPP']  && r['habs']['total']['adultos'] > 1
    ei['grupo']['insuranceIncluded'] = true
    htl['habs']['hasTransfer'] = this.extraInfo['grupo']['freeTransfer'] == '1' && (r['habs']['total']['monto']['n1']['monto'] / r['habs']['total']['adultos'] ) >= this.extraInfo['grupo']['freeTransferMinUsdPP']  && r['habs']['total']['adultos'] > 1

    let data = {
      hotel: htl,
      level: this.selectedLevel,
      extraInfo: ei,
      summarySearch: ss,
      selectedLevel: this.paqAmmount( r, 'level' ),
      type: 'hotel'
    }

    data = JSON.parse(JSON.stringify(data))
    this.rsv.emit({ action: 'doRsv', data })
  }
  
  doQuote( r = {} ){
    let data = {
      hotel: r,
      level: this.selectedLevel,
      extraInfo: this.extraInfo,
      summarySearch: this.summarySearch,
      selectedLevel: this.selectedLevel,
      type: 'hotel'
    }

    data = JSON.parse(JSON.stringify(data))
    this.rsv.emit({ action: 'doQuote', data })
  }

  test(){
    Swal.fire({
        title: `<strong>Fusionando Usuarios</strong>`,
        focusConfirm: false,
        showCancelButton: false,
        confirmButtonText: 'Confirmar Fusión',
        cancelButtonText: 'Cancelar'
      })
      // .then((result) => {
      //   if (result.isConfirmed) {
      //     this.mergeUsers( nu, usr )
      //   }
      // })
    Swal.showLoading()
  }

  insVal(){
    return (this.extraInfo['grupo']['insuranceIncluded'] ? 1 : 0) * (( this.hotelSearch.get('isUSD').value ? 1 : this.extraInfo['seguros']['total'][ this.summarySearch['nacionalidad']][ this.summarySearch['cobertura']]['tipoCambio']) * this.extraInfo['seguros']['total'][this.summarySearch['nacionalidad']][ this.summarySearch['cobertura']]['publico_ci'])
  }

  hotelVal( m, t ){

    // c['habs']['total']['monto'][l]['monto'] 

    if( this.hotelSearch.get('isUSD').value ){
      return m['monto']
    }else{
      if( this.extraInfo['grupo']['fixedMxn'] == '1' ){
        return m['monto_m']
      }else{
        return t * m['monto']
      }
    }
  }

  paqAmmount( c, v, t = 'i' ){

    let paqLevels = JSON.parse( this.extraInfo['grupo']['paqLevel'] )

    // console.log(paqLevels)

    let limit = paqLevels.length

    let hotel = 0
    let hotel_base = 0
    let hotel_ref = 0
    let seguro = 0
    let xfer = 0
    let nights = 0

    let i = 1

    let compare = []


    for( let pl of paqLevels ){



      hotel = (this.hotelSearch.get('isUSD').value ? 1 : c['tipoCambio']) * c['habs']['total']['monto']['n' + pl]['monto']
      hotel_base = (this.hotelSearch.get('isUSD').value ? 1 : c['tipoCambio']) * c['habs']['total']['monto']['n1']['monto']
      hotel_ref = (this.hotelSearch.get('isUSD').value ? 1 : c['tipoCambio']) * c['habs']['total']['monto']['n2']['monto']
      seguro = (this.hotelSearch.get('isUSD').value ? 1 : this.extraInfo['seguros']['total'][this.summarySearch['nacionalidad']][this.summarySearch['cobertura']]['tipoCambio']) * this.extraInfo['seguros']['total'][this.summarySearch['nacionalidad']][this.summarySearch['cobertura']]['publico_ci']
      nights = this.summarySearch['fin'].diff(this.summarySearch['inicio'], 'days')

      if( xfer[0] == 0 && (t == 'x' || t == 'xi') ){
        return 'N/A'
      }

      let x = 0
      let xfInfo = {}
      let z = 0

      switch(t){
        case 'i':
            x = seguro
            break
        case 'x':
        case 'xi':
          if( this.extraInfo['xfer'].length == 0 ){
            return 'N/a'
          }
          for( let xf of this.extraInfo['xfer'] ){
            x = xf[this.hotelSearch.get('isUSD').value ? 'usd_rate' : 'mxn_rate']  + (t == 'xi' ? seguro : 0)
            let dif = (hotel + x) - hotel_ref
            if( dif > 0 ){
              xfInfo = { 'name': xf['name'], 'rate':xf[this.hotelSearch.get('isUSD').value ? 'usd_rate' : 'mxn_rate'] }
              break
            }
          }
          break
        default:
          return 'N/A'
      }


      

      if( ((hotel + x) > hotel_ref  &&  (hotel + x) <= hotel_base) ){
      // if( ((hotel + x) > hotel_ref  &&  (hotel + x) <= hotel_base) || i == limit ){
        // if( i == limit ){
        //   return false
        // }

        // switch(v){
        //   case 'flag':
        //     return true
        //   case 'total':
        //       // console.log(c['hotel'], c['habName'], pl, hotel_ref, hotel_base, hotel + seguro, (hotel + seguro) - hotel_ref)
        //       return hotel + x
        //   case 'min':
        //       return x + (hotel / nights)
        //   case 'dif':
        //       return (hotel + x) - hotel_ref
        //   case 'level':
        //       return pl
        // }

        let arr = {
          flag:   true,
          total:  hotel + x,  
          min:    x + (hotel / nights),
          dif:    (hotel + x) - hotel_ref,
          level:  pl,  
        }

        if( t == 'x' || t == 'xi'){
          arr['xfer'] = xfInfo
        }

        compare.push( arr )

      }

      i++

    }

    compare = this.order.transform(compare, 'total')

    if( v == 'all' ){
      return compare
    }

    return compare[0] ? compare[0][v] : false

  }
  
  paqWInc( hab, tc, l ){

    tc = parseFloat(tc)


    let paqMxn = this.pkg.defInsPaq( hab, 2, 'array', tc, false, this.extraInfo['grupo']  )
    let paqUsd = this.pkg.defInsPaq( hab, 2, 'array', tc, true, this.extraInfo['grupo']  )

    let result = {}
      result['paqueteMXN'] = { 
        montoHotel: parseFloat(paqMxn['rate']).toFixed(2),
        montoHotelAjustado: parseFloat(paqMxn['hotelRate']).toFixed(2),
        montoMinimo: parseFloat(paqMxn['cRate']).toFixed(2),
        montoInclusion: (parseFloat(paqMxn['cRate']) - parseFloat(paqMxn['hotelRate'])).toFixed(2),
        seguro: (this.extraInfo['seguros'][l][this.summarySearch['nacionalidad']][this.summarySearch['cobertura']]['tipoCambio']) * this.extraInfo['seguros'][l][this.summarySearch['nacionalidad']][this.summarySearch['cobertura']]['publico_ci'],
        nights: this.summarySearch['fin'].diff(this.summarySearch['inicio'], 'days'),
      }
      result['paqueteUSD'] = { 
        montoHotel: parseFloat(paqUsd['rate']).toFixed(2),
        montoHotelAjustado: parseFloat(paqUsd['hotelRate']).toFixed(2),
        montoMinimo: parseFloat(paqUsd['cRate']).toFixed(2),
        montoInclusion: (parseFloat(paqUsd['cRate']) - parseFloat(paqUsd['hotelRate'])).toFixed(2),
        seguro: (1) * this.extraInfo['seguros'][l][this.summarySearch['nacionalidad']][this.summarySearch['cobertura']]['publico_ci'],
        nights: this.summarySearch['fin'].diff(this.summarySearch['inicio'], 'days'),
      }

      let paqAmmMxn = parseFloat(result['paqueteMXN']['montoHotel']) + parseFloat(result['paqueteMXN']['seguro']) + parseFloat(result['paqueteMXN']['montoInclusion'])
      let paqAmmUsd = parseFloat(result['paqueteUSD']['montoHotel']) + parseFloat(result['paqueteUSD']['seguro']) + parseFloat(result['paqueteUSD']['montoInclusion'])

      result['paqueteMXN']['montoPaq'] = result['paqueteMXN']['montoMinimo'] < paqAmmMxn ? (paqAmmMxn).toFixed(2) : (parseFloat(result['paqueteMXN']['montoMinimo'])*1.02).toFixed(2)
      result['paqueteMXN']['montoReal'] = (parseFloat(result['paqueteMXN']['montoHotel']) + parseFloat(result['paqueteMXN']['seguro']) + parseFloat(result['paqueteMXN']['montoInclusion'])).toFixed(2)
      result['paqueteMXN']['montoManual'] = (parseFloat(result['paqueteMXN']['montoHotel']) + (parseFloat(result['paqueteMXN']['montoPaq']) - parseFloat(result['paqueteMXN']['montoReal']))).toFixed(2)
      result['paqueteUSD']['montoPaq'] = result['paqueteUSD']['montoMinimo'] < paqAmmUsd ? (paqAmmUsd).toFixed(2) : (parseFloat(result['paqueteUSD']['montoMinimo'])*1.02).toFixed(2)
      result['paqueteUSD']['montoReal'] = (parseFloat(result['paqueteUSD']['montoHotel']) + parseFloat(result['paqueteUSD']['seguro']) + parseFloat(result['paqueteUSD']['montoInclusion'])).toFixed(2)
      result['paqueteUSD']['montoManual'] = (parseFloat(result['paqueteUSD']['montoHotel']) + (parseFloat(result['paqueteUSD']['montoPaq']) - parseFloat(result['paqueteUSD']['montoReal']))).toFixed(2)
      

    return result

  }
  
  totalPN( c, l ){
    let hotel = (this.hotelSearch.get('isUSD').value ? 1 : c['tipoCambio']) * c['habs']['total']['monto']['n' + l]['monto']
    let seguro = (this.extraInfo['grupo']['insuranceIncluded'] ? 1 : 0) * (this.hotelSearch.get('isUSD').value ? 1 : this.extraInfo['seguros']['total'][this.summarySearch['nacionalidad']][this.summarySearch['cobertura']]['tipoCambio']) * this.extraInfo['seguros']['total'][this.summarySearch['nacionalidad']][this.summarySearch['cobertura']]['publico_ci']
    let nights = this.summarySearch['fin'].diff(this.summarySearch['inicio'], 'days')

    return (hotel + seguro) / nights

  }

  pricePN( c, tc, h ){
    let nights = this.summarySearch['fin'].diff(this.summarySearch['inicio'], 'days')
    let hotel = ( this.hotelSearch.get('isUSD').value ? 1 : tc ) * c['total']['n' + this.selectedLevel]['monto']
    let seguros = ( (this.extraInfo['grupo']['insuranceIncluded'] ? 1 : 0) * (( this.hotelSearch.get('isUSD').value ? 1 : this.extraInfo['seguros'][h][this.summarySearch['nacionalidad']][this.summarySearch['cobertura']]['tipoCambio']) * this.extraInfo['seguros'][h][this.summarySearch['nacionalidad']][this.summarySearch['cobertura']]['publico_ci']))

    // console.log(nights, hotel, seguros)
    return (hotel + seguros) / nights
  }

  validateCurr(){
    let curr = this.hotelSearch.get('isUSD').value
    let flag = this.extraInfo['grupo'][ (curr ? 'usd' : 'mxn') + 'Active' ] == 1

    return flag
  }
  

  testData(){
    return { 'f': {
      "inicio": "2022-06-16T05:00:00.000Z",
      "fin": "2022-06-18T05:00:00.000Z",
      "habs": 1,
      "grupo": {
          "grupo": "3Day presummer_2022 (b)",
          "gpoTitle": "3Day presummer_2022 (b)",
          "hasPaq": "1",
          "hasInsurance": "1",
          "mainCampaign": "1"
      },
      "nacionalidad": "nacional",
      "noRestrict": false,
      "isUSD": false,
      "habitaciones": {
          "hab1": {
              "adultos": 2,
              "menores": 0
          }
      }
  }, 'ins': {
      "0": null,
      "ERR": false,
      "msg": "Seguros Obtenidos",
      "data": {
          "hab1": {
              "nacional": {
                  "normal": {
                      "prod": "R7",
                      "nombre": "Oasis H 2 PAX - NAC",
                      "cod": "98801",
                      "sufijo": "10A02",
                      "neto_si": 21,
                      "neto_ci": 24.36,
                      "publico_ci": 34.8,
                      "normal_ci": 120,
                      "dias": 3,
                      "tipoCambio": 21,
                      "pax": 2
                  }
              },
              "internacional": {
                  "normal": {
                      "prod": "6D",
                      "nombre": "Oasis H 2 PAX - Int/Recep AC 100",
                      "cod": "98831",
                      "sufijo": "20A02",
                      "neto_si": 28.2,
                      "neto_ci": 32.71,
                      "publico_ci": 48.72,
                      "normal_ci": 216,
                      "dias": 3,
                      "tipoCambio": 21,
                      "pax": 2
                  },
                  "extendida": {
                      "prod": "6B",
                      "nombre": "Oasis H 2 PAX - Int/Recep AC 250",
                      "cod": "98861",
                      "sufijo": "30A02",
                      "neto_si": 33,
                      "neto_ci": 38.28,
                      "publico_ci": 55.68,
                      "normal_ci": 300,
                      "dias": 3,
                      "tipoCambio": 21,
                      "pax": 2
                  }
              }
          },
          "total": {
              "nacional": {
                  "normal": {
                      "prod": "R7",
                      "nombre": "Oasis H 2 PAX - NAC",
                      "cod": "98801",
                      "sufijo": "10A02",
                      "neto_si": 21,
                      "neto_ci": 24.36,
                      "publico_ci": 34.8,
                      "normal_ci": 120,
                      "dias": 3,
                      "tipoCambio": 21,
                      "pax": 2
                  }
              },
              "internacional": {
                  "normal": {
                      "prod": "6D",
                      "nombre": "Oasis H 2 PAX - Int/Recep AC 100",
                      "cod": "98831",
                      "sufijo": "20A02",
                      "neto_si": 28.2,
                      "neto_ci": 32.71,
                      "publico_ci": 48.72,
                      "normal_ci": 216,
                      "dias": 3,
                      "tipoCambio": 21,
                      "pax": 2
                  },
                  "extendida": {
                      "prod": "6B",
                      "nombre": "Oasis H 2 PAX - Int/Recep AC 250",
                      "cod": "98861",
                      "sufijo": "30A02",
                      "neto_si": 33,
                      "neto_ci": 38.28,
                      "publico_ci": 55.68,
                      "normal_ci": 300,
                      "dias": 3,
                      "tipoCambio": 21,
                      "pax": 2
                  }
              }
          }
      }
  },
    
    'hot': {
        "ERR": false,
        "msg": "Tarifaro Obtenido",
        "data": [
            {
                "hotel": "GOC",
                "hotelName": "Grand Oasis Cancún",
                "habCode": "GSDR",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.59,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.6105,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.631,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6515,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6200000047683716,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":442,\"pax2\":624,\"pax3\":894,\"pax4\":1088,\"paxMenor\":84},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.59,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.6105,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.631,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6515,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6200000047683716,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":442,\"pax2\":624,\"pax3\":894,\"pax4\":1088,\"paxMenor\":84},\"isClosed\":0}}",
                "habName": "Standard",
                "maxOcc": "5",
                "maxAdults": "4",
                "maxChild": "3",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_goc.jpg",
                "minNights": "1"
            },
            {
                "hotel": "GOC",
                "hotelName": "Grand Oasis Cancún",
                "habCode": "GSUN",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.59,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.6105,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.631,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6515,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6200000047683716,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":470,\"pax2\":680,\"pax3\":978,\"pax4\":0,\"paxMenor\":84},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.59,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.6105,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.631,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6515,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6200000047683716,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":470,\"pax2\":680,\"pax3\":978,\"pax4\":0,\"paxMenor\":84},\"isClosed\":0}}",
                "habName": "Sunset",
                "maxOcc": "5",
                "maxAdults": "3",
                "maxChild": "3",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_goc.jpg",
                "minNights": "1"
            },
            {
                "hotel": "GOC",
                "hotelName": "Grand Oasis Cancún",
                "habCode": "GGRT",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.59,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.6105,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.631,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6515,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6200000047683716,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":480,\"pax2\":700,\"pax3\":1008,\"pax4\":0,\"paxMenor\":84},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.59,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.6105,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.631,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6515,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6200000047683716,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":480,\"pax2\":700,\"pax3\":1008,\"pax4\":0,\"paxMenor\":84},\"isClosed\":0}}",
                "habName": "Grand Terrace",
                "maxOcc": "5",
                "maxAdults": "3",
                "maxChild": "3",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_goc.jpg",
                "minNights": "1"
            },
            {
                "hotel": "GOC",
                "hotelName": "Grand Oasis Cancún",
                "habCode": "GDOV",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.59,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.6105,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.631,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6515,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6200000047683716,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":498,\"pax2\":736,\"pax3\":1062,\"pax4\":0,\"paxMenor\":84},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.59,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.6105,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.631,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6515,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6200000047683716,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":498,\"pax2\":736,\"pax3\":1062,\"pax4\":0,\"paxMenor\":84},\"isClosed\":0}}",
                "habName": "Ocean view",
                "maxOcc": "5",
                "maxAdults": "3",
                "maxChild": "3",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_goc.jpg",
                "minNights": "1"
            },
            {
                "hotel": "PYR",
                "hotelName": "The Pyramid at Grand Oasis",
                "habCode": "PSUN",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.56,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.582,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.604,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.63,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5907999873161316,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":494,\"pax2\":728,\"pax3\":1050,\"pax4\":0,\"paxMenor\":0},\"isClosed\":1},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.56,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.582,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.604,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.63,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5907999873161316,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":494,\"pax2\":728,\"pax3\":1050,\"pax4\":0,\"paxMenor\":0},\"isClosed\":1}}",
                "habName": "Standard",
                "maxOcc": "4",
                "maxAdults": "3",
                "maxChild": "2",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_pyr.jpg",
                "minNights": "1"
            },
            {
                "hotel": "PYR",
                "hotelName": "The Pyramid at Grand Oasis",
                "habCode": "GSUN",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.56,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.582,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.604,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.63,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5907999873161316,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":512,\"pax2\":764,\"pax3\":1104,\"pax4\":0,\"paxMenor\":0},\"isClosed\":1},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.56,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.582,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.604,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.63,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5907999873161316,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":512,\"pax2\":764,\"pax3\":1104,\"pax4\":0,\"paxMenor\":0},\"isClosed\":1}}",
                "habName": "Sunset",
                "maxOcc": "4",
                "maxAdults": "3",
                "maxChild": "2",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_pyr.jpg",
                "minNights": "1"
            },
            {
                "hotel": "PYR",
                "hotelName": "The Pyramid at Grand Oasis",
                "habCode": "GPOV",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.56,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.582,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.604,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.63,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5907999873161316,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":553,\"pax2\":846,\"pax3\":1227,\"pax4\":0,\"paxMenor\":0},\"isClosed\":1},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.56,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.582,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.604,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.63,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5907999873161316,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":553,\"pax2\":846,\"pax3\":1227,\"pax4\":0,\"paxMenor\":0},\"isClosed\":1}}",
                "habName": "Ocean View",
                "maxOcc": "4",
                "maxAdults": "3",
                "maxChild": "2",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_pyr.jpg",
                "minNights": "1"
            },
            {
                "hotel": "PYR",
                "hotelName": "The Pyramid at Grand Oasis",
                "habCode": "SKST",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.56,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.582,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.604,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.63,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5907999873161316,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":553,\"pax2\":846,\"pax3\":1227,\"pax4\":0,\"paxMenor\":0},\"isClosed\":1},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.56,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.582,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.604,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.63,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5907999873161316,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":553,\"pax2\":846,\"pax3\":1227,\"pax4\":0,\"paxMenor\":0},\"isClosed\":1}}",
                "habName": "Sian Kaan Standard",
                "maxOcc": "3",
                "maxAdults": "3",
                "maxChild": "0",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_pyr.jpg",
                "minNights": "1"
            },
            {
                "hotel": "PYR",
                "hotelName": "The Pyramid at Grand Oasis",
                "habCode": "GPOF",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.56,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.582,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.604,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.63,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5907999873161316,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":580,\"pax2\":900,\"pax3\":1290,\"pax4\":0,\"paxMenor\":0},\"isClosed\":1},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.56,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.582,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.604,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.63,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5907999873161316,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":580,\"pax2\":900,\"pax3\":1290,\"pax4\":0,\"paxMenor\":0},\"isClosed\":1}}",
                "habName": "Ocean Front",
                "maxOcc": "4",
                "maxAdults": "3",
                "maxChild": "2",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_pyr.jpg",
                "minNights": "1"
            },
            {
                "hotel": "PYR",
                "hotelName": "The Pyramid at Grand Oasis",
                "habCode": "GSTE",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.56,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.582,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.604,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.63,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5907999873161316,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":595,\"pax2\":930,\"pax3\":0,\"pax4\":0,\"paxMenor\":0},\"isClosed\":1},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.56,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.582,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.604,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.63,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5907999873161316,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":595,\"pax2\":930,\"pax3\":0,\"pax4\":0,\"paxMenor\":0},\"isClosed\":1}}",
                "habName": "Suite",
                "maxOcc": "2",
                "maxAdults": "2",
                "maxChild": "0",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_pyr.jpg",
                "minNights": "1"
            },
            {
                "hotel": "PYR",
                "hotelName": "The Pyramid at Grand Oasis",
                "habCode": "SKJS",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.56,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.582,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.604,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.63,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5907999873161316,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":630,\"pax2\":1000,\"pax3\":0,\"pax4\":0,\"paxMenor\":0},\"isClosed\":1},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.56,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.582,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.604,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.63,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5907999873161316,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":630,\"pax2\":1000,\"pax3\":0,\"pax4\":0,\"paxMenor\":0},\"isClosed\":1}}",
                "habName": "Sian Kaan Junior Suite",
                "maxOcc": "2",
                "maxAdults": "2",
                "maxChild": "0",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_pyr.jpg",
                "minNights": "1"
            },
            {
                "hotel": "PYR",
                "hotelName": "The Pyramid at Grand Oasis",
                "habCode": "SKMS",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.56,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.582,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.604,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.63,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5907999873161316,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":680,\"pax2\":1100,\"pax3\":0,\"pax4\":0,\"paxMenor\":0},\"isClosed\":1},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.56,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.582,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.604,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.63,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5907999873161316,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":680,\"pax2\":1100,\"pax3\":0,\"pax4\":0,\"paxMenor\":0},\"isClosed\":1}}",
                "habName": "Sian Kaan Master Suite",
                "maxOcc": "2",
                "maxAdults": "2",
                "maxChild": "0",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_pyr.jpg",
                "minNights": "1"
            },
            {
                "hotel": "OPB",
                "hotelName": "Oasis Palm",
                "habCode": "OPSR",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.55,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5725,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.6,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.62,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5814999938011169,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":401,\"pax2\":542,\"pax3\":771,\"pax4\":972,\"paxMenor\":84},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.55,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5725,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.6,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.62,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5814999938011169,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":401,\"pax2\":542,\"pax3\":771,\"pax4\":972,\"paxMenor\":84},\"isClosed\":0}}",
                "habName": "Estandar",
                "maxOcc": "5",
                "maxAdults": "4",
                "maxChild": "3",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_opb.jpg",
                "minNights": "1"
            },
            {
                "hotel": "OPB",
                "hotelName": "Oasis Palm",
                "habCode": "DLXS",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.55,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5725,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.6,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.62,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5814999938011169,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":430,\"pax2\":600,\"pax3\":858,\"pax4\":1088,\"paxMenor\":84},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.55,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5725,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.6,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.62,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5814999938011169,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":430,\"pax2\":600,\"pax3\":858,\"pax4\":1088,\"paxMenor\":84},\"isClosed\":0}}",
                "habName": "Superior",
                "maxOcc": "5",
                "maxAdults": "4",
                "maxChild": "3",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_opb.jpg",
                "minNights": "1"
            },
            {
                "hotel": "OPB",
                "hotelName": "Oasis Palm",
                "habCode": "DFS",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.55,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5725,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.6,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.62,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5814999938011169,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":613,\"pax2\":966,\"pax3\":1407,\"pax4\":1820,\"paxMenor\":84},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.55,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5725,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.6,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.62,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5814999938011169,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":613,\"pax2\":966,\"pax3\":1407,\"pax4\":1820,\"paxMenor\":84},\"isClosed\":0}}",
                "habName": "Family Suite",
                "maxOcc": "5",
                "maxAdults": "4",
                "maxChild": "3",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_opb.jpg",
                "minNights": "1"
            },
            {
                "hotel": "GOP",
                "hotelName": "Grand Oasis Palm",
                "habCode": "GSDR",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.57,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5915,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.613,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6345,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6000999808311462,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":442,\"pax2\":624,\"pax3\":894,\"pax4\":0,\"paxMenor\":84},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.57,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5915,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.613,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6345,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6000999808311462,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":442,\"pax2\":624,\"pax3\":894,\"pax4\":0,\"paxMenor\":84},\"isClosed\":0}}",
                "habName": "Grand ",
                "maxOcc": "5",
                "maxAdults": "3",
                "maxChild": "3",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_gop.jpg",
                "minNights": "1"
            },
            {
                "hotel": "GOP",
                "hotelName": "Grand Oasis Palm",
                "habCode": "GDLV",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.57,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5915,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.613,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6345,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6000999808311462,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":470,\"pax2\":680,\"pax3\":978,\"pax4\":0,\"paxMenor\":84},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.57,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5915,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.613,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6345,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6000999808311462,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":470,\"pax2\":680,\"pax3\":978,\"pax4\":0,\"paxMenor\":84},\"isClosed\":0}}",
                "habName": "Lagoon View",
                "maxOcc": "5",
                "maxAdults": "3",
                "maxChild": "3",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_gop.jpg",
                "minNights": "1"
            },
            {
                "hotel": "GOP",
                "hotelName": "Grand Oasis Palm",
                "habCode": "GDOV",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.57,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5915,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.613,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6345,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6000999808311462,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":498,\"pax2\":736,\"pax3\":1062,\"pax4\":0,\"paxMenor\":84},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.57,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5915,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.613,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6345,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6000999808311462,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":498,\"pax2\":736,\"pax3\":1062,\"pax4\":0,\"paxMenor\":84},\"isClosed\":0}}",
                "habName": "Grand Ocean view",
                "maxOcc": "5",
                "maxAdults": "3",
                "maxChild": "3",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_gop.jpg",
                "minNights": "1"
            },
            {
                "hotel": "GOP",
                "hotelName": "Grand Oasis Palm",
                "habCode": "SKST",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.57,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5915,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.613,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6345,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6000999808311462,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":498,\"pax2\":736,\"pax3\":0,\"pax4\":0,\"paxMenor\":0},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.57,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5915,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.613,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6345,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6000999808311462,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":498,\"pax2\":736,\"pax3\":0,\"pax4\":0,\"paxMenor\":0},\"isClosed\":0}}",
                "habName": "Sian Kaan Standard",
                "maxOcc": "2",
                "maxAdults": "2",
                "maxChild": "0",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_gop.jpg",
                "minNights": "1"
            },
            {
                "hotel": "GOP",
                "hotelName": "Grand Oasis Palm",
                "habCode": "GPJS",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.57,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5915,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.613,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6345,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6000999808311462,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":570,\"pax2\":880,\"pax3\":0,\"pax4\":0,\"paxMenor\":0},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.57,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5915,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.613,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6345,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6000999808311462,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":570,\"pax2\":880,\"pax3\":0,\"pax4\":0,\"paxMenor\":0},\"isClosed\":0}}",
                "habName": "Sian Kaan Junior Suite",
                "maxOcc": "2",
                "maxAdults": "2",
                "maxChild": "0",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_gop.jpg",
                "minNights": "1"
            },
            {
                "hotel": "GOP",
                "hotelName": "Grand Oasis Palm",
                "habCode": "SMSU",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.57,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5915,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.613,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6345,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6000999808311462,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":620,\"pax2\":980,\"pax3\":0,\"pax4\":0,\"paxMenor\":0},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.57,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5915,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.613,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6345,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6000999808311462,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":620,\"pax2\":980,\"pax3\":0,\"pax4\":0,\"paxMenor\":0},\"isClosed\":0}}",
                "habName": "Sian Kaan Master Suite",
                "maxOcc": "2",
                "maxAdults": "2",
                "maxChild": "0",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_gop.jpg",
                "minNights": "1"
            },
            {
                "hotel": "GOP",
                "hotelName": "Grand Oasis Palm",
                "habCode": "GDFS",
                "tarifa_pp": "1",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.57,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5915,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.613,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6345,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6000999808311462,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":687,\"pax2\":1114,\"pax3\":1629,\"pax4\":2268,\"paxMenor\":84},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.57,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5915,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.613,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6345,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.6000999808311462,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":687,\"pax2\":1114,\"pax3\":1629,\"pax4\":2268,\"paxMenor\":84},\"isClosed\":0}}",
                "habName": "Grand Family Suite",
                "maxOcc": "5",
                "maxAdults": "4",
                "maxChild": "3",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_gop.jpg",
                "minNights": "1"
            },
            {
                "hotel": "SMART",
                "hotelName": "Smart Cancún by Oasis",
                "habCode": "STEP",
                "tarifa_pp": "0",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.47,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.523,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.55,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5099999904632568,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":160,\"pax2\":160,\"pax3\":180,\"pax4\":210,\"paxMenor\":0},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.47,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.523,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.55,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5099999904632568,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":160,\"pax2\":160,\"pax3\":180,\"pax4\":210,\"paxMenor\":0},\"isClosed\":0}}",
                "habName": "Smart",
                "maxOcc": "4",
                "maxAdults": "4",
                "maxChild": "2",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_smart.jpg",
                "minNights": "1"
            },
            {
                "hotel": "SMART",
                "hotelName": "Smart Cancún by Oasis",
                "habCode": "SMSP",
                "tarifa_pp": "0",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.47,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.523,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.55,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5099999904632568,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":180,\"pax2\":180,\"pax3\":220,\"pax4\":250,\"paxMenor\":0},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.47,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.523,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.55,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5099999904632568,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":180,\"pax2\":180,\"pax3\":220,\"pax4\":250,\"paxMenor\":0},\"isClosed\":0}}",
                "habName": "Smart Plus",
                "maxOcc": "4",
                "maxAdults": "4",
                "maxChild": "2",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_smart.jpg",
                "minNights": "1"
            },
            {
                "hotel": "OH",
                "hotelName": "Oh! The Urban Oasis",
                "habCode": "GSTD",
                "tarifa_pp": "0",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.53,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5535,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.58,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6005,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5629000067710876,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":200,\"pax2\":200,\"pax3\":240,\"pax4\":0,\"paxMenor\":0},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.53,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5535,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.58,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6005,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5629000067710876,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":200,\"pax2\":200,\"pax3\":240,\"pax4\":0,\"paxMenor\":0},\"isClosed\":0}}",
                "habName": "Estandar",
                "maxOcc": "3",
                "maxAdults": "3",
                "maxChild": "0",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_oh.jpg",
                "minNights": "1"
            },
            {
                "hotel": "OH",
                "hotelName": "Oh! The Urban Oasis",
                "habCode": "GSTE",
                "tarifa_pp": "0",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.53,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5535,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.58,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6005,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5629000067710876,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":260,\"pax2\":260,\"pax3\":0,\"pax4\":0,\"paxMenor\":0},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.53,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.5535,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.58,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.6005,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.5629000067710876,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":260,\"pax2\":260,\"pax3\":0,\"pax4\":0,\"paxMenor\":0},\"isClosed\":0}}",
                "habName": "Suite",
                "maxOcc": "2",
                "maxAdults": "2",
                "maxChild": "0",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_oh.jpg",
                "minNights": "1"
            },
            {
                "hotel": "OHOC",
                "hotelName": "Oh! Cancun on the Beach",
                "habCode": "OHGDN",
                "tarifa_pp": "0",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.29,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.33,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.361,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.4,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.3400000035762787,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":240,\"pax2\":240,\"pax3\":280,\"pax4\":320,\"paxMenor\":0},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.29,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.33,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.361,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.4,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.3400000035762787,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":240,\"pax2\":240,\"pax3\":280,\"pax4\":320,\"paxMenor\":0},\"isClosed\":1}}",
                "habName": "Garden",
                "maxOcc": "4",
                "maxAdults": "4",
                "maxChild": "2",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_ohoc.jpg",
                "minNights": "1"
            },
            {
                "hotel": "OHOC",
                "hotelName": "Oh! Cancun on the Beach",
                "habCode": "OHGDS",
                "tarifa_pp": "0",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.29,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.33,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.361,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.4,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.3400000035762787,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":262,\"pax2\":262,\"pax3\":302,\"pax4\":342,\"paxMenor\":0},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.29,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.33,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.361,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.4,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.3400000035762787,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":262,\"pax2\":262,\"pax3\":302,\"pax4\":342,\"paxMenor\":0},\"isClosed\":1}}",
                "habName": "Garden Superior",
                "maxOcc": "4",
                "maxAdults": "4",
                "maxChild": "2",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_ohoc.jpg",
                "minNights": "1"
            },
            {
                "hotel": "OHOC",
                "hotelName": "Oh! Cancun on the Beach",
                "habCode": "OHOF",
                "tarifa_pp": "0",
                "jsonData": "{\"2022-06-16\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.29,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.33,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.361,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.4,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.3400000035762787,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":280,\"pax2\":280,\"pax3\":321,\"pax4\":360,\"paxMenor\":0},\"isClosed\":0},\"2022-06-17\":{\"n1\":{\"name\":\"Publica\",\"code\":\"1 (JM)\",\"descuento\":0.29,\"active\":1,\"allEnabled\":1},\"n2\":{\"name\":\"Silver\",\"code\":\"2 (Jm)\",\"descuento\":0.33,\"active\":1,\"allEnabled\":1},\"n3\":{\"name\":\"Gold\",\"code\":\"3 (jM)\",\"descuento\":0.361,\"active\":1,\"allEnabled\":1},\"n4\":{\"name\":\"Platinum\",\"code\":\"4 (jm)\",\"descuento\":0.4,\"active\":1,\"allEnabled\":0},\"n5\":{\"name\":\"Paquete\",\"code\":\"5 (JN)\",\"descuento\":0.3400000035762787,\"active\":1,\"allEnabled\":0},\"precio\":{\"pax1\":280,\"pax2\":280,\"pax3\":321,\"pax4\":360,\"paxMenor\":0},\"isClosed\":1}}",
                "habName": "Ocean Front",
                "maxOcc": "4",
                "maxAdults": "4",
                "maxChild": "2",
                "isNR": "0",
                "isCC": "1",
                "tipoCamas": "3",
                "tipoCambio": "19.5",
                "hotelUrl": "https://cyc-oasishoteles.com/assets/img/logos/logo_ohoc.jpg",
                "minNights": "1"
            }
        ],
        "extra": {
            "grupo": {
                "grupo": "3Day presummer_2022 (b)",
                "grupoCielo": "3Day presummer_2022 (b)",
                "discountCode": "3Day presummer_2022 (b)",
                "xldPolicy": "24h-ta8",
                "cieloUSD": "3DPSB2",
                "cieloMXN": "3DPSB2",
                "mayorista": "DIR",
                "mxAgencia": "CALLMXPH",
                "mxAgenciaNR": "CALLMXNR",
                "usAgencia": "CALLUSPH",
                "usAgenciaNR": "CALLUSNR",
                "mxAgenciaEp": "CALMPHDI",
                "mxAgenciaEpNR": "CALMNRDI",
                "usAgenciaEp": "CALPHDI",
                "usAgenciaEpNR": "CALNRDI",
                "bwInicio": "2022-06-08",
                "bwFin": "2022-06-30",
                "p1": "C,3,6,9,12",
                "p2": "C,3,6,9,12",
                "p3": "C,3,6,9,12",
                "p4": "C,3,6,9,12",
                "p5": "C,3,6,9,12",
                "activo": "1",
                "code1": "1 (JM)",
                "code2": "2 (Jm)",
                "code3": "3 (jM)",
                "code4": "4 (jm)",
                "code5": "5 (JN)",
                "code6": null,
                "code7": null,
                "code8": null,
                "code9": null,
                "Last_Update": "2022-06-15 16:47:56",
                "fixedTC": null,
                "notComision": "0",
                "ccOnly": "0",
                "comAg": "0.025",
                "comGe": "0.005",
                "tipoComision": "1",
                "l1_name": "Publica",
                "l2_name": "Silver",
                "l3_name": "Gold",
                "l4_name": "Platinum",
                "l5_name": "Paquete",
                "l1_active": "1",
                "l2_active": "1",
                "l3_active": "1",
                "l4_active": "1",
                "l5_active": "1",
                "l1_allEnabled": "1",
                "l2_allEnabled": "1",
                "l3_allEnabled": "1",
                "l4_allEnabled": "0",
                "l5_allEnabled": "0",
                "defaultLevel": "2",
                "mainCampaign": "1",
                "isLocal": "0",
                "isOR": "1",
                "hasPaq": "1",
                "paqLevel": "[5,3]",
                "hasInsurance": "1",
                "insuranceAtFirst": "1",
                "insurancePacked": "1",
                "freeTransfer": "0",
                "freeTransferMinUsdPP": "240",
                "usdActive": "1",
                "mxnActive": "1",
                "pagoEnHotel": "1",
                "centroSinImpuestos": "0"
            }
        }
    }}
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


