import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService, InitService } from 'src/app/services/service.index';

import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

import * as moment from 'moment-timezone';
import 'moment/locale/es-mx';
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
  selector: 'app-account-config',
  templateUrl: './account-config.component.html',
  styleUrls: ['./account-config.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class AccountConfigComponent implements OnInit {

  personales = this.fb.group({
    Nombre:           [{ value: '', disabled: true }],
    Usuario:          [{ value: '', disabled: true }],
    Fecha_Nacimiento: [''],
    Telefono1:        ['', Validators.pattern("^[0-9]{10}$")],
    Telefono2:        ['', Validators.pattern("^[0-9]{10}$")],
    correo_personal:  ['', Validators.email],
  })

  password = this.fb.group({
    old_password:     ['', Validators.required ],
    new_password:     ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15), Validators.pattern("^[a-zA-Z\@\-\_\$0-9]+$")]],
    repeat_password:  ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15), Validators.pattern("^[a-zA-Z\@\-\_\$0-9]+$")]],

  },{
    validators: this.samePass('new_password', 'repeat_password')
  })

  loading = {}
  display = 'personales'

  constructor(
    public configDialog: MatDialogRef<AccountConfigComponent>,
    private fb: FormBuilder,
    private _api: ApiService,
    public _init: InitService,
    @Inject(MAT_DIALOG_DATA) public data
  ) { 
    moment.locale('es-mx');
  }

  ngOnInit(): void {
    this.getPersonales()
  }

  onNoClick(): void {
    this.configDialog.close();
  }

  samePass(a, b){
    return ( formGroup: FormGroup ) => {

      const nwp = formGroup.get(a)
      const rpt = formGroup.get(b)

      if( nwp.value == rpt.value ){
        rpt.setErrors(null)
      }else{
        rpt.setErrors({ notEqual: true })
      }

    }
  }

  getPersonales(){

    this.loading['loading'] = true;


    this._api.restfulGet( this._init.currentUser.hcInfo.id, 'Asesores/personalData' )
                .subscribe( res => {

                  this.loading['loading'] = false;

                  let d = res['data']

                  this.personales.get('Nombre')           .setValue(d['Nombre'])
                  this.personales.get('Usuario')          .setValue(d['Usuario'])
                  this.personales.get('Fecha_Nacimiento')  .setValue(d['Fecha_Nacimiento'])
                  this.personales.get('Telefono1')        .setValue(d['Telefono1'])
                  this.personales.get('Telefono2')        .setValue(d['Telefono2'])
                  this.personales.get('correo_personal')  .setValue(d['correo_personal'])

                  this.display = 'personales'

                }, err => {
                  this.loading['loading'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });

  }

  getErrorMessage( ctrl, form = this.personales ) {

   
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
      return 'Solo números, letras y símolos como "@" "-" "_" "$". No se acepta "ñ"';
    }
    
    if (form.get(ctrl).hasError('finMenorIgual')) {
      return 'La fecha final debe ser mayor al inicio';
    }
    
    if (form.get(ctrl).hasError('inicioPasado')) {
      return 'La fecha inicial no puede ser en el pasado';
    }
    
    if (form.get(ctrl).hasError('notEqual')) {
      return 'Debe ser igual al campo de arriba';
    }
    
    if (form.get(ctrl).hasError('minlength')) {
      return `Se requieren mínimo ${ form.get(ctrl).errors.minlength.requiredLength } caracteres`
    }
    
    if (form.get(ctrl).hasError('maxlength')) {
      return `Máximo ${ form.get(ctrl).errors.maxlength.requiredLength } caracteres`;
    }
    
    return 'El campo tiene errores';
  }

  save( d ){
    switch( d ){
      case 'personales':
        this.changePersonal()
        break;
      case 'password':
        this.changePassword()
        break;
    }
  }
  
  getFormValid( d ){
    switch( d ){
      case 'personales':
        return this.personales.valid 
      case 'password':
        return this.password.valid
    }
  }

  changePassword(){

    let params = {
      usp: this.password.get('old_password').value,
      new: this.password.get('new_password').value
    }

    Swal.fire({
      title: 'Cambiando Contraseña',
      showCancelButton: false,
      showConfirmButton: false,
    })

    Swal.showLoading()

    this._api.restfulPut( params, 'Login/chgPwd' )
        .subscribe( res => {
          
          this.password.reset()
          Swal.close()
          Swal.fire('Cambios realizados', 'Tu password se a modificado correctamente', 'success')
          this.onNoClick()

        }, err => {

          const error = err.error;

          Swal.close()
          Swal.fire('Error', error.msg, 'error')
          console.error(err.statusText, error.msg);

        })
  }

  changePersonal(){

    Swal.fire({
      title: 'Cambiando Datos Personales',
      showCancelButton: false,
      showConfirmButton: false,
    })

    Swal.showLoading()

    this._api.restfulPut( this.personales.value, 'Asesores/editPersonalData' )
        .subscribe( res => {
          
          this.personales.reset()
          Swal.close()
          Swal.fire('Cambios realizados', 'Tu información se ha actualizado correctamente', 'success')
          this.onNoClick()

        }, err => {

          const error = err.error;

          Swal.close()
          Swal.fire('Error', error.msg, 'error')
          console.error(err.statusText, error.msg);

        })
  }

}
