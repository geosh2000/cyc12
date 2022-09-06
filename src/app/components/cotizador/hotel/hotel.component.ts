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
import { PackageBuilderV2Component } from './package-builder-v2/package-builder-v2.component';

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

  @ViewChild( PackageBuilderComponent, { static: false } ) pkg2: PackageBuilderComponent;
  @ViewChild( PackageBuilderV2Component, { static: false } ) pkg: PackageBuilderV2Component;
  
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

                    

                   console.log(result)
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

    //let raw = JSON.parse(JSON.stringify(r))
    
    let raw = JSON.parse(JSON.stringify(r))

    // over en true es para paquetes
    let selectedLevel = over ? (this.extraInfo['grupo']['insuranceIncludedPaq'] == '1' ? 2 : this.selectedLevel) : this.selectedLevel
    let usd = this.hotelSearch.get('isUSD').value
    
    if( this.extraInfo['grupo']['insuranceIncludedPaq'] == '1' && selectedLevel != 4){
      for( let h in raw['habs']['porHabitacion'] ){
        let hab = raw['habs']['porHabitacion'][h]
        hab['insPaq'] = this.pkg.defInsPaq( hab, selectedLevel, 'array', raw['tipoCambio'], usd, this.extraInfo['grupo'] )
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
      hotel: raw,
      level: selectedLevel,
      extraInfo: ei,
      summarySearch: ss,
      selectedLevel: selectedLevel,
      type: 'hotel'
    }


    console.log(r,raw)
    this.rsv.emit({ action: 'doRsv', data, r: raw })
  }

  rsvPaq( raw = {} ){

    let r = Object.assign({},raw)

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


