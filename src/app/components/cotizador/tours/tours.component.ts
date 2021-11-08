import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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

export interface Proveedor {
  id: number;
  name: string;
}

export interface Entrada {
  id: number;
  value: string;
}

@Component({
  selector: 'cotiza-tours',
  templateUrl: './tours.component.html',
  styleUrls: ['./tours.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class CotizaToursComponent implements OnInit {

  @Output() rsv = new EventEmitter<any>()
  @Input() data: any;

  loading = {}

  tourSearch: FormGroup

  minDate = moment().add(2, 'days')
  maxDate = moment(`${moment().add(1, 'years').format('YYYY')}-12-19`)
  
  // Listados
  proveedores = []
  filteredProveedores: Observable<any>;
  
  entradas = []
  filteredEntradas: Observable<any>;

  horarios = []
  places = []

  // Flags
  noDispo = false
  noTours = false
  noPlace = false
  showUsd = false
  noResults = false

  cotizacion = {}
  tourDescription = ""

  summarySearch

  constructor( private _api: ApiService, private toastr: ToastrService, public _init: InitService, private order: OrderPipe) { 

    moment.locale('es-mx');

    this.createForm()

  }

  resetValues(){
    this.tourSearch.reset({})
    this.createForm()
  }

  createForm(){
    this.tourSearch =  new FormGroup({
      ['fecha']:        new FormControl({ value: '',  disabled: false }, [ Validators.required ]),
      ['proveedor']:    new FormControl({ value: '',  disabled: false }, [ Validators.required ]),
      ['entrada']:      new FormControl({ value: '',  disabled: true }, [ Validators.required ]),
      ['horario']:      new FormControl({ value: '',  disabled: true }, [ Validators.required ]),
      ['show']:         new FormControl({ value: '',  disabled: false }, [] ),
      ['place']:        new FormControl({ value: '',  disabled: true }, [ Validators.required ] ),
      ['adultos']:      new FormControl({ value: 1,   disabled: false }, [] ),
      ['adultosReales']:new FormControl({ value: 1,   disabled: false }, [] ),
      ['children']:     new FormControl({ value: 0,   disabled: false }, [] ),
      ['childrenReales']:new FormControl({ value: 0,  disabled: false }, [] ),
      ['babiesReales']: new FormControl({ value: 0,   disabled: false }, [] ),
      ['transporte']:   new FormControl({ value: false,   disabled: false }, [] ),
      ['muelle']:       new FormControl({ value: false,   disabled: false }, [] ),
    })

    this.tourSearch.controls['fecha'].valueChanges.subscribe( x => { 
      if( x != null ){
        if( this.tourSearch.controls['entrada'].value != '' ){
          this.tourSearch.controls['horario'].enable()
        }
      }

      if( this.tourSearch.controls['entrada'].valid ){
        this.tourSearch.controls['horario'].setValue('')

        if( x != '' ){
          this.getHorarios( this.tourSearch.controls['entrada'].value )
        }
      }
      
    })
    
    this.tourSearch.controls['proveedor'].valueChanges.subscribe( x => { 
      this.entradas = []

      if( x != null && x != '' ){
        this.getEntradas( x.id )
        this.tourSearch.controls['entrada'].enable()
      }else{
        this.tourSearch.controls['entrada'].disable()
        this.tourSearch.controls['horario'].disable()
      }
      
      this.tourSearch.controls['entrada'].setValue('')
      this.tourSearch.controls['horario'].setValue('')
    })
    
    this.tourSearch.controls['entrada'].valueChanges.subscribe( x => { 
      this.getDescription()
      this.horarios = []

      if( x != null && x != '' && x != []){
        if( this.tourSearch.controls['fecha'].value != '' ){
          this.getHorarios( x )
          this.tourSearch.controls['horario'].enable()
        }
      }else{
        this.tourSearch.controls['horario'].disable()
        this.noDispo = false
      }

      this.tourSearch.controls['horario'].setValue('')
      this.tourSearch.controls['show'].setValue('')
      this.tourSearch.controls['place'].setValue('')
      this.getPickUp( 'a' )
    })
    
    this.tourSearch.controls['horario'].valueChanges.subscribe( x => { 

    })

    this.filteredProveedores = this.tourSearch.controls['proveedor'].valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value ? value.name : ''),
      map(name => name ? this._filterP(name) : this.proveedores.slice())
    );

    this.filteredEntradas = this.tourSearch.controls['entrada'].valueChanges.pipe(
      startWith(''),
      map(val => typeof val === 'string' ? val : val ? val.value : '' ),
      map(value => value ? this._filterE(value) : this.entradas.slice())
    );
  }

  ngOnInit(): void {

    this.getProveedores()

    // No Restrict Dates for Supervisors
    if( this._init.checkSingleCredential('app_cotizador_noRestrict') ){
      this.minDate = moment()
      this.maxDate = moment().add(2,'years')
    }

  }

  displayFn( p ): string {
    if( p ){
      return p['name'] ? p['name'].toLocaleLowerCase() : (p['value'] ? p['value'].toLocaleLowerCase() : '');
    }else{
      return ''
    }
  }

  _filterP(name: string): Proveedor[] {
    const filterValue = name.toLowerCase()

    return this.proveedores.filter(option => {
      return option.name.toLowerCase().includes(filterValue)
    });
  }
  
  _filterE(value: string): Entrada[] {
    const filterValue = value.toLowerCase()

    return this.entradas.filter(option => {
      return option.value.toLowerCase().includes(filterValue)
    });
  }


  getProveedores(){
    this.loading['proveedor'] = true

    this._api.restfulGet( '', 'Cmaya/proveedores' )
                .subscribe( res => {

                  this.loading['proveedor'] = false;

                  let result = []
                  for( let p of res['data'] ){
                    if( p['status'] ){
                      result.push(p)
                    }
                  } 

                  this.proveedores = this.order.transform(result,'name')
                  this.tourSearch.controls['proveedor'].setValue('')

                }, err => {
                  this.loading['proveedor'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  getEntradas( p ){

    if( !p ){
      return false
    }

    this.loading['entrada'] = true

    this._api.restfulGet( p, 'Cmaya/tours' )
                .subscribe( res => {

                  this.loading['entrada'] = false;

                  this.entradas = this.order.transform(res['data'],'value')
                  this.tourSearch.controls['entrada'].setValue('')

                  if( this.entradas.length == 0 ){
                    this.noTours = true
                  }else{
                    this.noTours = false
                  }

                }, err => {
                  this.loading['entrada'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  getHorarios( p ){
    this.loading['horario'] = true

    if( this.tourSearch.controls['fecha'].value == '' ||  this.tourSearch.controls['fecha'].value == null){
      return false
    }

    this._api.restfulGet( `${this.tourSearch.controls['fecha'].value.format('DD-MM-YYYY')}/${p['id']}/${ p['type'] == 'tour' ? 1 : 0 }`, 'Cmaya/horarios' )
                .subscribe( res => {

                  this.loading['horario'] = false;
                  this.horarios = res['data']

                  if( this.horarios.length == 0 ){
                    this.tourSearch.controls['horario'].setValidators(null);
                    this.tourSearch.controls['horario'].disable()
                    this.noDispo = true
                  }else{
                    this.tourSearch.controls['horario'].setValidators( [ Validators.required ]);
                    this.tourSearch.controls['horario'].enable()
                    this.noDispo = false
                  }

                }, err => {
                  this.loading['horario'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }
  
  getPickUp( e, p = this.tourSearch.controls['entrada'].value ){

    // console.log(e)

    if( this.tourSearch.controls['horario'].value == '' ){
      // console.log('No se busca pick up sin horario establecido')
      return false
    }
    
    // console.log('Buscando pickup', this.tourSearch.controls['horario'].value)

    this.loading['show'] = true

    this._api.restfulGet( `${this.tourSearch.controls['fecha'].value.format('DD-MM-YYYY')}/${p['id']}/${ p['type'] == 'tour' ? 1 : 0 }`, 'Cmaya/pickup' )
                .subscribe( res => {

                  this.loading['show'] = false;
                  this.tourSearch.controls['show'].setValue( res['data'] );
                  this.getPlaces()
                  
                }, err => {
                  this.loading['show'] = false;
                  this.tourSearch.controls['show'].setValue( '' );

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  getPlaces( p = this.tourSearch.controls['entrada'].value ){
    this.loading['place'] = true

    this._api.restfulGet( `${p['id']}/${ p['type'] == 'tour' ? 1 : 0 }`, 'Cmaya/pickupPlace' )
                .subscribe( res => {

                  this.loading['place'] = false;
                  this.places = res['data']

                  if( this.places.length == 0 ){
                    this.tourSearch.controls['place'].setValidators(null);
                    this.tourSearch.controls['place'].disable()
                    this.noPlace = true
                  }else{
                    this.tourSearch.controls['place'].setValidators( [ Validators.required ]);
                    this.tourSearch.controls['place'].enable()
                    this.noPlace = false
                  }

                }, err => {
                  this.loading['place'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  getDescription( p = this.tourSearch.controls['entrada'].value ){

    if( !p['id'] ){
      return false
    }

    this.loading['description'] = true
    this.tourDescription = ""

    this._api.restfulGet( `${p['id']}/${ p['type'] == 'tour' ? 1 : 0 }`, 'Cmaya/tourDescription' )
                .subscribe( res => {

                  this.loading['description'] = false;

                  if( res['data']['descripcion'] == null ){
                    this.tourDescription = 'N/A'
                  }else{
                    let desc = res['data']['descripcion'].replace(/(?:\r\n|\r|\n)/g, '<br>');
                    desc = desc.replace(/(?:\t)/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
                    this.tourDescription = desc
                  }

                }, err => {
                  this.loading['description'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  getErrorMessage( ctrl, form = this.tourSearch ) {

    
    if ( this.loading[ctrl] ){
      return 'Cargando ' + ctrl + '...'
    }
    
    if (form.controls[ctrl].hasError('required')) {
      return 'Este valor es obligatorio';
    }
    
    if (form.controls[ctrl].hasError('email')) {
      return 'El valor debe tener formato de email';
    }
    
    if (form.controls[ctrl].hasError('min')) {
      return 'El valor debe ser mayor o igual a ' + form.controls[ctrl].errors.min.min;
    }

    return 'El campo tiene errores';
  }

  chgPax( e, f ){

    switch(f){
      case 'adultos':
        if( this.tourSearch.controls['adultosReales'].value < e.target.value ){
          this.tourSearch.controls['adultosReales'].setValue( e.target.value )
        }
        break;
      case 'children':
        if( this.tourSearch.controls['childrenReales'].value < e.target.value ){
          this.tourSearch.controls['childrenReales'].setValue( e.target.value )
        }
        break;
      default: 
        return false
    }

  }

  cotizar(){

    this.cotizacion = {}
    this.loading['cotizar'] = true

    this.summarySearch = this.tourSearch.value

    this._api.restfulPut( this.tourSearch.value, 'Cmaya/cotizarTour' )
                .subscribe( res => {

                  this.loading['cotizar'] = false;
                  this.cotizacion = res['data'] == null ? {} : res['data']
                  this.noResults = res['data'] == null

                  // console.log(res['data'])
                  // console.log(res['params'])

                }, err => {
                  this.loading['cotizar'] = false;
                  this.summarySearch = {}

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });

  }

  doRsv( r = {} ){
    let data = {
      tour: r,
      isUsd: this.showUsd,
      summarySearch: this.summarySearch,
      type: 'tour'
    }

    data = JSON.parse(JSON.stringify(data))
    this.rsv.emit({ action: 'doRsv', data })
  }

  

}
