import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiService, InitService } from 'src/app/services/service.index';

import Swal from 'sweetalert2'

@Component({
  selector: 'app-link-generator',
  templateUrl: './link-generator.component.html',
  styleUrls: ['./link-generator.component.css']
})
export class LinkGeneratorComponent implements OnInit {

  @ViewChild('linkFormDom') form: NgForm;

  // Auxiliares
  loading = {}

  // Catalogos
  groups = []

  // Form
  linkForm: UntypedFormGroup

  // Results
  linkData = {}

  constructor( 
      private _api: ApiService, 
      public _init: InitService,
      private fb: UntypedFormBuilder
      ) { 
      this.createForm()
    }

  ngOnInit(): void {
    this.getGroups()
  }

  createForm(){
    this.linkForm =  this.fb.group({
      empresa:      [{ value: '',  disabled: false }, [ Validators.required ] ],
      // grupo:        [{ value: '',  disabled: false }, [ Validators.required ] ],
      grupo:        [{ value: this._init.currentUser.hcInfo.idGrupo || '',  disabled: false }, [ Validators.required ] ],
      referencia:   [{ value: '',   disabled: false }, [ Validators.required, Validators.pattern('^[a-zA-Z0-9-_]*') ], this.referenceExists.bind(this) ],
      monto:        [{ value: '',  disabled: false }, [ Validators.required, Validators.min(1) ] ],
      moneda:       [{ value: '',  disabled: false }, [ Validators.required ] ]
    })

    // this.linkForm.controls['habs'].valueChanges.subscribe( x => { 

    //   this.roomsControls(x)

    // })

    // this.hotelSearch.controls['habs'].setValue(1)
  }

  referenceExists( control: UntypedFormControl ): Promise<any>| Observable<any>{

    let thisData:any = this

    let promesa = new Promise(
      (resolve, reject) =>{

        let params = {
          val: control.value.trim(),
          compare: 'real_reference'
        }

        thisData._api.restfulPut( params, 'Pagos/referenceExist')
          .subscribe( res => {

            let exists = res['flag']

            if( exists ){
              resolve({existe: true})
            }else{
              resolve(null)
            }
           })

      }
    )
    return promesa
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

  genLink(){
    this.loading['generating'] = true
    this.linkData = {}


    this._api.restfulPut( this.linkForm.value, 'Pagos/manualLink' )
                .subscribe( res => {

                  this.loading['generating'] = false;
                  this.linkData = res['data']

                  Swal.fire({
                    title: 'Link Generado',
                    icon: 'success',
                    html: `
                      <p><b>Referencia: <b><span class="text-primary">${ this.linkData['linkRef'] }</span></p>
                      <p><b>Id: <b><span class="text-primary">${ this.linkData['id'] }</span></p>
                      `,
                    focusConfirm: true,
                    confirmButtonText: 'Aceptar y copiar link de pago',
                    allowOutsideClick: false
                  }).then( ( result ) => {

                    /* Read more about isConfirmed, isDenied below */
                    if (result.isConfirmed) {
                      this.copyUrl( this.linkData['linkRef'] + '/' + this.linkData['id'] )
                    }
                  })

                  this.resetValues()

                }, err => {
                  this.loading['generating'] = false;

                  const error = err.error;

                  Swal.fire({
                    title: err.statusText,
                    icon: 'error',
                    text: error.msg,
                    focusConfirm: true,
                    confirmButtonText: 'Cerrar',
                    allowOutsideClick: false
                  })

                  console.error(err.statusText, error.msg);

                });
  }

  alert(){
    Swal.fire({
      icon: 'success',
      title: 'Liga Generada', 
      html: '<p>Aquí estara el link y referencia <a href="">Why do I have this issue?</a></p>',
    })
  }

  resetValues(){

    this.linkForm.reset()
    this.form.resetForm();
    this.createForm()
    
  }

  getErrorMessage( ctrl, form = this.linkForm ) {

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
      return 'Letras, números y símbolos "-" o "_". No espacios ni acentos';
    }
    
    if (form.get(ctrl).hasError('finMenorIgual')) {
      return 'La fecha final debe ser mayor al inicio';
    }
    
    if (form.get(ctrl).hasError('inicioPasado')) {
      return 'La fecha inicial no puede ser en el pasado';
    }
    
    
    if (form.get(ctrl).hasError('existe')) {
      return 'La referencia ya existe en la base de datos. Debes crear una referencia unica';
    }
    
    return 'El campo tiene errores';
  }

  copyUrl( t ){
    let getUrl = window.location;
    let baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];

    let r = baseUrl + '/#/doPayment/' + t
    this._init.copyToClipboard( r )
  }

}
