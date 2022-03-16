import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, InitService } from 'src/app/services/service.index';

import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import * as moment from 'moment-timezone';
import 'moment/locale/es-mx';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
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
  selector: 'cotiza-daypass',
  templateUrl: './daypass.component.html',
  styleUrls: ['./daypass.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class CotizaDaypassComponent implements OnInit {
  
  @Output() rsv = new EventEmitter<any>()

  loading = {}

  daypassSearch: FormGroup
  summarySearch = {}

  minDate = moment( moment().format('YYYY-MM-DD'))
  maxDate = moment(`${moment().add(1, 'years').format('YYYY')}-12-19`)
  
  constructor( 
    private _api: ApiService, 
    public _init: InitService, 
    public dialog: MatDialog,
    private fb: FormBuilder,
    private sanitization:DomSanitizer,
    private order: OrderPipe ) { 
      moment.locale('es-mx');

      this.createForm()
    }

  ngOnInit(): void {  
  }

  cotizar(){
    this.summarySearch = this.daypassSearch.value
    this.summarySearch['fecha'] = this.daypassSearch.get('fecha').value.format('YYYY-MM-DD')
  }

  chgOcc( f, e ){
    console.log( f,e )
    console.log( this.daypassSearch.value )
  }


  createForm(){
    this.daypassSearch =  this.fb.group({
      fecha:      [{ value: '',  disabled: false }, [ Validators.required ] ],
      adults:     [{ value: 1,  disabled: false }, [ Validators.required ] ],
      juniors:    [{ value: 0,  disabled: false }, [ Validators.required ] ],
      childs:     [{ value: 0,  disabled: false }, [ Validators.required ] ],
      isLocal:   [{ value: false,  disabled: false }, [ Validators.required ] ],
      isUSD:        [{ value: false,  disabled: false }, [ Validators.required ] ]
    })

    this.daypassSearch.controls['fecha'].valueChanges.subscribe( x => { 
      this.cotizar()
    })

    this.daypassSearch.get('isUSD').valueChanges.subscribe( x => { 
      this.summarySearch['isUSD'] = x
    })

    this.daypassSearch.get('isLocal').valueChanges.subscribe( x => { 
      this.summarySearch['isLocal'] = x
    })

    this.daypassSearch.get('adults').valueChanges.subscribe( x => { 
      this.summarySearch['adults'] = x
    })

    this.daypassSearch.get('juniors').valueChanges.subscribe( x => { 
      this.summarySearch['juniors'] = x
    })

    this.daypassSearch.get('childs').valueChanges.subscribe( x => { 
      this.summarySearch['childs'] = x
    })

  }

  getErrorMessage( ctrl, form = this.daypassSearch ) {

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
}
