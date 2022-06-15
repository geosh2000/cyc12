import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
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
  selector: 'app-link-report',
  templateUrl: './link-report.component.html',
  styleUrls: ['./link-report.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class LinkReportComponent implements OnInit {

  @ViewChild('filterFormDom') form: NgForm;
  @ViewChild( MatPaginator ) paginator: MatPaginator;
  @ViewChild( MatSort ) sort: MatSort;

  // Auxiliares
  loading = {}

  // Catalogos
  groups = []
  creators = []

  // Form
  filterForm: UntypedFormGroup

  // Rules
  minDate = moment(moment('2021-09-30').format('YYYY-MM-DD'))
  maxDate = moment()

  // Results
  linkData = []

  // Table
  displayColumns = []
  dataSource = new MatTableDataSource([])

  constructor( 
    private _api: ApiService, 
    public _init: InitService,
    private fb: UntypedFormBuilder
    ) { 

      // TABLE COLUMNS
      this.displayColumns = [
        'id',
        'departamento',
        'userCreated',
        'reference',
        'monto',
        'dtCreated',
        'Acciones'
      ]

    this.createForm()

    moment.locale('es-mx');
  }

  ngOnInit(): void {
    this.getGroups()
    this.getCretors()
  }

  getGroups(){
    this.loading['grupo'] = true

    this._api.restfulGet( '', 'Lists/departamentos' )
                .subscribe( res => {

                  this.loading['grupo'] = false;
                  this.groups = res['data']

                }, err => {
                  this.loading['grupo'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });
  }

  getCretors(){
    this.loading['creador'] = true

    this._api.restfulGet( '', 'Pagos/linkCreators' )
                .subscribe( res => {

                  this.loading['creador'] = false;
                  this.creators = res['data']

                }, err => {
                  this.loading['creador'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });
  }

  dateFilter = (d: moment.Moment | null): boolean => {
    const day = (d || moment());

    return day > this.minDate
  }

  createForm(){
    this.filterForm =  this.fb.group({
      referencia:    [{ value: '',  disabled: false }, [ ] ],
      grupo:         [{ value: '',  disabled: false }, [ ] ],
      creador:       [{ value: '',   disabled: false }, [ ] ],
      inicio:         [{ value: '',  disabled: false }, [ Validators.required ] ],
      fin:         [{ value: '',  disabled: false }, [ Validators.required ] ]
    },{
      validators: this.dateValidation('inicio', 'fin')
    })

  }

  dateValidation( a: string, b: string ){
    return ( formGroup: UntypedFormGroup ) => {

      const inicio = formGroup.get(a)
      const fin = formGroup.get(b)

      if( inicio.value <= fin.value ){
        fin.setErrors(null)
      }else{
        fin.setErrors({ finMenorIgual: true })
      }

      if( fin.value > moment(inicio.value).add(1,'months') ){
        fin.setErrors({ maxRange: true })
      }

      if( inicio.value < moment(moment('2021-09-29').format('YYYY-MM-DD')) ){
        inicio.setErrors({ minDate: true })
      }
    }
  }

  resetValues(){

    this.filterForm.reset()
    this.form.resetForm();
    this.createForm()
    
  }

  getLinks(){
    this.loading['links'] = true

    this._api.restfulPut( this.filterForm.value, 'Pagos/linkReport' )
                .subscribe( res => {

                  this.loading['links'] = false;
                  this.linkData = res['data']
                  this.dataSource = new MatTableDataSource(res['data'])
                  this.dataSource.paginator = this.paginator;
                  this.dataSource.sort = this.sort;

                  // console.log( res )

                }, err => {
                  this.loading['links'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });
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
      return 'La fecha inicial debe ser a partir del 30 de septiembre de 2021';
    }
    
    if (form.get(ctrl).hasError('maxRange')) {
      return 'El rango de fechas no puede exceder 1 mes';
    }

    
    return 'El campo tiene errores';
  }

  copyLink( l ){
    let getUrl = window.location;
    let baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];

    let r = baseUrl + '/#/doPayment/' + l['reference'] + '/' + l['id']

    this._init.copyToClipboard( r )

    Swal.fire('Copiado', 'El link se encuentra en tu portapapeles, puedes pegarlo presionando CTRL + V en el cuadro de texto de tu correo / whatsapp o aplicación preferida', 'success');
  }

  openVoucher( l ){
    let vUrl = 'https://cyc-oasishoteles.com/voucherPreview/view.php?ref='

    window.open( vUrl + l.reference, '_blank');
  }


}
