import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';
import { ApiService, InitService } from 'src/app/services/service.index';

import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

import * as moment from 'moment-timezone';
import 'moment/locale/es-mx';
import { OrderPipe } from 'ngx-order-pipe';


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

@Component({
  selector: 'cotiza-traslados',
  templateUrl: './traslados.component.html',
  styleUrls: ['./traslados.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class CotizaTrasladosComponent implements OnInit {

  @Output() rsv = new EventEmitter<any>()
  @Input() data: any;

  loading = {}

  xferSearch: FormGroup

  minDate = moment().add(2, 'days')
  maxDate = moment(`${moment().add(1, 'years').format('YYYY')}-12-19`)

  // Listados
  destinos = []
  origenes = []
  filteredDestinos: Observable<any>;
  filteredOrigenes: Observable<any>;

  // Flags
  showOpen        = false
  showArrival     = false
  showDeparture   = false
  noResults       = false
  filterExpanded  = true
  showUsd         = false

  // Results
  cotizacion = []

  grupo = [ 'Pagado', 'Cortesia' ]
  tipos = {
    'Privado': [
        {name: 'Redondo- Aeropuerto - Hotel - Aeropuerto',  arrival: true, departure: true, open: false, flight: true, origin: {"id": 1421,"name": "**AEROPUERTO CANCUN**"}, destination: null},
        {name: 'Hacia al Aeropuerto',                       arrival: false, departure: true, open: false, flight: true, origin: null, destination: {"id": 1421,"name": "**AEROPUERTO CANCUN**"}},
        {name: 'Desde el Aeropuerto',                       arrival: true, departure: false, open: false, flight: true, origin: {"id": 1421,"name": "**AEROPUERTO CANCUN**"}, destination: null},
        {name: 'Intermedio One Way',                        arrival: false, departure: true, open: false, flight: false, origin: null, destination: null},
        {name: 'Intermedio Round Trip',                     arrival: true, departure: true, open: false, flight: false, origin: null, destination: null},
      ],
    'Compartido': [
      {name: 'Redondo- Aeropuerto - Hotel - Aeropuerto',  arrival: true, departure: true, open: false, flight: true, origin: {"id": 1421,"name": "**AEROPUERTO CANCUN**"}, destination: null},
      {name: 'Hacia el Aeropuerto',                       arrival: false, departure: true, open: false, flight: true, origin: null, destination: {"id": 1421,"name": "**AEROPUERTO CANCUN**"}},
      {name: 'Desde el Aeropuerto',                       arrival: true, departure: false, open: false, flight: true, origin: {"id": 1421,"name": "**AEROPUERTO CANCUN**"}, destination: null},
    ],
    'Abierto': [
      {name: 4, origin: '', destination: '', arrival: false, departure: true, open: true, flight: false, },
      {name: 6, origin: '', destination: '', arrival: false, departure: true, open: true, flight: false, },
      {name: 8, origin: '', destination: '', arrival: false, departure: true, open: true, flight: false, },
      {name: 10, origin: '', destination: '', arrival: false, departure: true, open: true, flight: false, },
      {name: 12, origin: '', destination: '', arrival: false, departure: true, open: true, flight: false, },
    ]
  }

  constructor( private _api: ApiService, private toastr: ToastrService, public _init: InitService, private order: OrderPipe ) { 

    moment.locale('es-mx');

    this.createForm()

  }

  resetValues(){
    this.xferSearch.reset({})
    this.createForm()
  }

  createForm(){
    this.xferSearch =  new FormGroup({
      ['grupo']:          new FormControl({ value: '',  disabled: false }, [ Validators.required ]),
      ['destino']:        new FormControl({ value: '',  disabled: true }, [ Validators.required ]),
      ['origen']:         new FormControl({ value: '',  disabled: true }, [ Validators.required ]),
      ['servicio']:       new FormControl({ value: 'Traslado',  disabled: false }, [ Validators.required ]),
      ['tipo']:           new FormControl({ value: '',  disabled: true }, [ Validators.required ]),
      ['ruta']:           new FormControl({ value: '',  disabled: true }, [ Validators.required ]),
      ['adultos']:        new FormControl({ value: 1,   disabled: false }, [ Validators.required ]),
      ['children']:       new FormControl({ value: 0,   disabled: false }, [ Validators.required ]),
      ['babies']:         new FormControl({ value: 0,   disabled: false }, [ Validators.required ]),
      ['llegada']:        new FormGroup({
                                ['fecha']:    new FormControl({ value: '',  disabled: true }, [ Validators.required ]),          
                                ['vuelo']:    new FormControl({ value: '',  disabled: true }, [ Validators.required ]),          
                                ['hora']:     new FormControl({ value: '',  disabled: true }, [ Validators.required, Validators.pattern("^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$") ]),          
      }),
      ['salida']:        new FormGroup({
                                ['fecha']:    new FormControl({ value: '',  disabled: true }, [ Validators.required ]),          
                                ['vuelo']:    new FormControl({ value: '',  disabled: true }, [ Validators.required ]),          
                                ['hora']:     new FormControl({ value: '',  disabled: true }, [ Validators.required, Validators.pattern("^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$") ]),          
                                ['horaAbierto']:    new FormControl({ value: '',  disabled: true }, [ Validators.required, Validators.pattern("^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$") ]),
                                ['pickup']:   new FormControl({ value: '',  disabled: true }, [ Validators.required, Validators.pattern("^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$") ]),          
                              }),
    })

    this.xferSearch.controls['grupo'].valueChanges.subscribe( x => { 

      if( x == 'Cortesia' ){
        let pax = this.totalPax()
        this.xferSearch.controls['tipo'].setValue( pax > 2 ? 'Privado' : 'Compartido')
        this.xferSearch.controls['tipo'].disable()
      }else{
        if( x != '' ){
          this.xferSearch.controls['tipo'].enable()
        }else
          this.xferSearch.controls['tipo'].disable()
      }
      
    })
    
    this.xferSearch.controls['adultos'].valueChanges.subscribe( x => { 

      if( this.xferSearch.controls['grupo'].value == 'Cortesia' ){
        let pax = this.totalPax()

        if( pax > 2 ){
          if( this.xferSearch.controls['tipo'].value != 'Privado' ){
            this.xferSearch.controls['tipo'].setValue('Privado')
          }
        }else{
          if( this.xferSearch.controls['tipo'].value == 'Privado' ){
            this.xferSearch.controls['tipo'].setValue('Compartido')
          }
        }

        if( this.xferSearch.controls['tipo'].enabled ){
          this.xferSearch.controls['tipo'].disable()
        }
        
      }
      
    })
    
    this.xferSearch.controls['tipo'].valueChanges.subscribe( x => { 

      this.xferSearch.controls['ruta'].setValue('')
      this.xferSearch.controls['origen'].disable()
      this.xferSearch.controls['destino'].disable()
      
      if( x != '' ){
        this.xferSearch.controls['ruta'].enable()
        
      }else{
        this.xferSearch.controls['ruta'].disable()
      }
      
    })

    this.xferSearch.controls['ruta'].valueChanges.subscribe( x => { 

      if( x ){
        if( x['origin'] != null ){
          this.xferSearch.controls['origen'].disable()
          this.xferSearch.controls['origen'].setValue( x['origin'] )
        }else{
          this.xferSearch.controls['origen'].enable()     
          // this.xferSearch.controls['origen'].setValue( '' )
        }
        
        if( x['destination'] != null ){
          this.xferSearch.controls['destino'].disable()
          this.xferSearch.controls['destino'].setValue( x['destination'] )
        }else{
          this.xferSearch.controls['destino'].enable()
          // this.xferSearch.controls['destino'].setValue( '' )
        }

        if( this.xferSearch.controls['tipo'].value == 'Abierto' ){
          this.xferSearch.controls['origen'].enable()     
          // this.xferSearch.controls['origen'].setValue( '' )
          this.xferSearch.controls['destino'].enable()
          // this.xferSearch.controls['destino'].setValue( '' )
        }

        if( x['arrival'] ){
          this.showArrival = true
          this.xferSearch.get('llegada.fecha').enable()
          this.xferSearch.get('llegada.vuelo').enable()
          this.xferSearch.get('llegada.hora').enable()
          // this.xferSearch.get('llegada.fecha').setValue('')
          // this.xferSearch.get('llegada.vuelo').setValue('')
          // this.xferSearch.get('llegada.hora').setValue('')
        }else{
          this.showArrival = false
          this.xferSearch.get('llegada.fecha').disable()
          this.xferSearch.get('llegada.vuelo').disable()
          this.xferSearch.get('llegada.hora').disable()
        }
        
        
        if( x['departure'] ){
          this.showDeparture = true
          this.xferSearch.get('salida.vuelo').enable()
          this.xferSearch.get('salida.fecha').enable()
          this.xferSearch.get('salida.hora').enable()
          this.xferSearch.get('salida.pickup').enable()
          // this.xferSearch.get('salida.vuelo').setValue('')
          // this.xferSearch.get('salida.fecha').setValue('')
          // this.xferSearch.get('salida.hora').setValue('')
          // this.xferSearch.get('salida.pickup').setValue('')
        }else{
          this.showDeparture = false
          this.xferSearch.get('salida.fecha').disable()
          this.xferSearch.get('salida.vuelo').disable()
          this.xferSearch.get('salida.hora').disable()
          this.xferSearch.get('salida.pickup').disable()
        }
        
        if( x['open'] ){
          this.xferSearch.get('salida.vuelo').disable()
          this.xferSearch.get('salida.hora').disable()
          this.xferSearch.get('salida.pickup').disable()
          this.xferSearch.get('salida.horaAbierto').enable()
          // this.xferSearch.get('salida.horaAbierto').setValue('')
        }else{
          this.xferSearch.get('salida.horaAbierto').disable()
        }
        
        if( !x['flight'] ){
          this.xferSearch.get('llegada.vuelo').disable()
          this.xferSearch.get('salida.vuelo').disable()
        }


      }else{
        this.xferSearch.controls['origen'].disable()     
        // this.xferSearch.controls['origen'].setValue( '' )
        this.xferSearch.controls['destino'].disable()     
        // this.xferSearch.controls['destino'].setValue( '' )
      }

      
    })

    this.filteredDestinos = this.xferSearch.controls['destino'].valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value ? value.name : '' ),
      map(name => name ? this._filterD(name) : this.destinos.slice())
    );
    
    this.filteredOrigenes = this.xferSearch.controls['origen'].valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value ? value.name : '' ),
      map(name => name ? this._filterO(name) : this.origenes.slice())
    );
  }

  ngOnInit(): void {
    this.getDestinos()

    // No Restrict Dates for Supervisors
    if( this._init.checkSingleCredential('app_cotizador_noRestrict') ){
      this.minDate = moment()
      this.maxDate = moment().add(2,'years')
    }

  }

  private _filterD(value: string): string[] {
    const filterValue = value.toLowerCase()

    return this.destinos.filter(option => {
      return option.name.toLowerCase().includes(filterValue)
    });
  }

  private _filterO(value: string): string[] {
    const filterValue = value.toLowerCase()

    return this.origenes.filter(option => {
      return option.name.toLowerCase().includes(filterValue)
    });
  }

  displayFn( p ): string {
    if( p ){
      return p['name'] ? p['name'].toLocaleLowerCase() : (p['value'] ? p['value'].toLocaleLowerCase() : '');
    }else{
      return ''
    }
  }

  getErrorMessage( ctrl, form = this.xferSearch ) {

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
    
    if (form.get(ctrl).hasError('pattern')) {
      return 'Formato HH:MM 24hrs';
    }
    
    return 'El campo tiene errores';
  }

  getDestinos(){
    this.loading['destino'] = true

    this._api.restfulGet( '', 'Cmaya/destinos' )
                .subscribe( res => {

                  this.loading['destino'] = false;

                  this.destinos = this.order.transform(res['data'],'name')
                  this.origenes = this.order.transform(res['data'],'name')
                  this.xferSearch.controls['destino'].setValue('')

                }, err => {
                  this.loading['destino'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  cotizar(){

    this.loading['cotizar'] = true

    let defaults = {
      destino: this.xferSearch.get('destino').disabled,
      origen: this.xferSearch.get('origen').disabled
    }

    
    this.xferSearch.get('origen').enable()
    this.xferSearch.get('destino').enable()

    this.cotizacion = []

    this._api.restfulPut( this.xferSearch.value, 'Cmaya/cotizarTraslado' )
                .subscribe( res => {

                  this.loading['cotizar'] = false;

                  this.cotizacion = res['data'] == null ? [] : res['data']
                  this.noResults = res['data'] == null
                  

                  if( defaults['origen'] ){
                    this.xferSearch.get('origen').disable()
                  }
                  if( defaults['destino'] ){
                    this.xferSearch.get('destino').disable()
                  }


                  if( !this.noResults ){
                    // this.resetValues()
                    this.filterExpanded = false
                  }else{
                    this.filterExpanded = true
                  }

                }, err => {
                  this.loading['cotizar'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  getPlace( i ){
    let result = this.origenes.find( v => {
      if( v.id == i ){
        return v.name
      } 
    })

    if( result ){
      return result.name
    }else{
      return 'NA'
    }
  }

  getDate( d ){
    return moment(d).format( 'DD-MM-YYYY' )
  }

  totalPax( f = this.xferSearch.controls ){
    return f['adultos'].value + f['children'].value
  }



}
