import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { ApiService, InitService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';
import 'moment/locale/es-mx';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import Swal from 'sweetalert2';

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
  selector: 'app-aplicacion-pagos-cielo',
  templateUrl: './aplicacion-pagos-cielo.component.html',
  styleUrls: ['./aplicacion-pagos-cielo.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class AplicacionPagosCieloComponent implements OnInit {

  @ViewChild('filterFormDom') form: NgForm;
  @ViewChild( MatPaginator ) paginator: MatPaginator;
  @ViewChild( MatSort ) sort: MatSort;

  // Auxiliares
  loading = {}

  // Catalogos
  groups = []
  creators = []

  // Form
  filterForm: FormGroup

  // Rules
  minDate = moment(moment('2021-09-30').format('YYYY-MM-DD'))
  maxDate = moment()

  // Results
  list = []

  // Table
  displayColumns = []
  dataSource = new MatTableDataSource([])

  constructor( 
    private _api: ApiService, 
    public _init: InitService,
    private fb: FormBuilder
    ) { 

      // TABLE COLUMNS
      this.displayColumns = [
        'itemLocatorId',
        'cashTransactionId',
        'accountId',
        'monto',
        'dtCreated',
        'cieloTxId',
        'txType',
        // 'cieloApplied',
        // 'cambioAplicado',
        'hotel',
        'inicio',
        // 'confirmation',
        'gpoTfa',
        // 'itemType',
        // 'tipo',
        // 'complejo',
        'Acciones'
      ]

    this.createForm()

    moment.locale('es-mx');
  }

  ngOnInit(): void {
    
  }

  dateFilter = (d: moment.Moment | null): boolean => {
    const day = (d || moment());

    return day > this.minDate
  }

  createForm(){
    this.filterForm =  this.fb.group({
      complejo:              [{ value: '',  disabled: false }, [ ] ],
      fechaPago_inicio:         [{ value: '',  disabled: false }, [ ] ],
      fechaPago_fin:            [{ value: '',  disabled: false }, [ ] ],
      fechaAplicacion_inicio:   [{ value: '',   disabled: false }, [ ] ],
      fechaAplicacion_fin:      [{ value: '',   disabled: false }, [ ] ],
      fechaInicio_inicio:       [{ value: '',  disabled: false }, [ ] ],
      fechaInicio_fin:          [{ value: '',  disabled: false }, [ ] ]
    },{
      validators: this.dateValidation('fechaPago_inicio', 'fechaPago_fin','fechaAplicacion_inicio', 'fechaAplicacion_fin','fechaInicio_inicio', 'fechaInicio_fin')
    })

  }

  dateValidation( a: string, b: string, c: string, d: string, e: string, f: string ){
    return ( formGroup: FormGroup ) => {

      const vals = [
        formGroup.get(a),
        formGroup.get(b),
        formGroup.get(c),
        formGroup.get(d),
        formGroup.get(e),
        formGroup.get(f),
      ]

      for( let i=0; i < 6; i += 2 ){

        if( vals[i].value == null && vals[i+1].value == null ){
          vals[i+1].setErrors(null)
          vals[i].setErrors(null)
        }else{
          if( vals[i].value <= vals[i+1].value ){
            vals[i+1].setErrors(null)
          }else{
            vals[i+1].setErrors({ finMenorIgual: true })
          }
    
          if( vals[i+1].value > moment(vals[i].value).add(5,'days') ){
            vals[i+1].setErrors({ maxRange: true })
          }
    

        }
      }


    }
  }

  resetValues(){

    this.filterForm.reset()
    this.form.resetForm();
    this.createForm()
    
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getErrorMessage( ctrl, form = this.filterForm ) {

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
    
    if (form.get(ctrl).hasError('minDate')) {
      return 'La fecha inicial debe ser a partir del 01 de enero de 2021';
    }
    
    if (form.get(ctrl).hasError('maxRange')) {
      return 'El rango de fechas no puede exceder 5 dias';
    }

    
    return 'El campo tiene errores';
  }


  getPayments(){

    let params = this.filterForm.value

    for( let f in params ){
      if( moment.isMoment( params[f] ) ){
        params[f] = params[f].format('YYYY-MM-DD')
      }

      if( params[f] == '' ){
        delete params[f]
      }
    }

    this.loading['list'] = true

    this._api.restfulPut( params, 'Rsv/cieloApplyPendings' )
                .subscribe( res => {

                  this.loading['list'] = false;
                  this.list = res['data']

                  this.dataSource = new MatTableDataSource(res['data'])
                  this.dataSource.paginator = this.paginator;
                  this.dataSource.sort = this.sort;

                }, err => {
                  this.loading['list'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });
  }

  apply( l ){
    l.loading = true
  
      this._api.restfulPut( { txId: l.cashTransactionId }, 'Rsv/applyPaymentsCielo' )
                  .subscribe( res => {
  
                    l.loading = false;
                    this._init.snackbar( 'success', 'Aplicadas', res['msg'] );
                    l.cieloTxId = 'Aplicado'
                    l['applied'] = true
  
                  }, err => {
                    l.loading = false;
  
                    const error = err.error;

                    if( error['error'] && error['error']['txErrores'] ){
                      let cieloErr = JSON.parse( error['error']['txErrores'][0]['error'] )
                      l.cieloTxId = cieloErr[0]['error']
                    }

                    this._init.snackbar( 'error', error.msg, err.status );
                    console.error(err.statusText, error.msg);
  
                  });
    }

}
