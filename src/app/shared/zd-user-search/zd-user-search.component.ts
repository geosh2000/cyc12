import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatStep, MatStepper, StepperOrientation } from '@angular/material/stepper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, InitService } from 'src/app/services/service.index';

@Component({
  selector: 'app-zd-user-search',
  templateUrl: './zd-user-search.component.html',
  styleUrls: ['./zd-user-search.component.css']
})
export class ZdUserSearchComponent implements OnInit {

  @ViewChild('selectedUserForm') selUserForm: ElementRef;
  @ViewChild('zdUserSearchStepper') userSearchStepper: MatStepper;
  @ViewChild('doneStep') doneStep: MatStep;

  loading = {}
  usersFound = []

  optionalEdit = true

  stepperOrientation: Observable<StepperOrientation>;
  step = 0

  firstFormGroup = this._formBuilder.group({
    inputVal: ['', Validators.required],
    byTicket: [{value: false, disabled: true}],
  });
  secondFormGroup = this._formBuilder.group({
    userSelected: ['', Validators.required]
  });
  thirdFormGroup = this._formBuilder.group({
    name:           ['', Validators.required ],
    email:          ['', Validators.compose([ Validators.required, Validators.email ])],
    phone:          ['', Validators.pattern("^[\+][0-9]{1,3}[0-9]{10}$") ],
    whatsapp:       ['', Validators.pattern("^[\+][0-9]{1,3}[[1]?[0-9]{10}$") ],
    idioma_cliente: ['', Validators.required ],
    nacionalidad:   ['', Validators.required ],
  });

  constructor(
    private _formBuilder: FormBuilder,
    private _api: ApiService,
    private _init: InitService,
    breakpointObserver: BreakpointObserver
      ) { 
        this.stepperOrientation = breakpointObserver.observe('(min-width: 800px)')
          .pipe(
            map(
              ({matches}) => matches ? 'horizontal' : 'vertical')
              );
  }

  ngOnInit(): void {

    this.firstFormGroup.get('inputVal').valueChanges.subscribe( x => { 
      if( !x.match(/^[\d]*$/) ){
        // this.firstFormGroup.get('byTicket').disable()
        this.firstFormGroup.get('byTicket').setValue(false)
      }else{
        // this.firstFormGroup.get('byTicket').disable()
        this.firstFormGroup.get('byTicket').setValue(true)
      }
    })
  }

  stepChange( e ){
    // console.log( e )

    this.step = e.selectedIndex

    switch( e.selectedIndex ){
      case 1:
        if( e.previouslySelectedIndex < 1 ){
          this.searchZd()
        }
        break
      case 2:
        if( e.previouslySelectedIndex == 1 ){
          this.validateUser()
        }

        if( this.usersFound.length == 0 ){
          this.secondFormGroup.reset()
        }
        // console.log( this.secondFormGroup.get('userSelected').value )
        break
    }
  }

  validateUser(){
    this.thirdFormGroup.get('name').setValue( this.secondFormGroup.get('userSelected').value['name'])
    this.thirdFormGroup.get('email').setValue( this.secondFormGroup.get('userSelected').value['email'])
    this.thirdFormGroup.get('phone').setValue( this.secondFormGroup.get('userSelected').value['phone'])
    this.thirdFormGroup.get('whatsapp').setValue( this.secondFormGroup.get('userSelected').value['user_fields']['whatsapp'])
    this.thirdFormGroup.get('idioma_cliente').setValue( this.secondFormGroup.get('userSelected').value['user_fields']['idioma_cliente'])
    this.thirdFormGroup.get('nacionalidad').setValue( this.secondFormGroup.get('userSelected').value['user_fields']['nacionalidad'])

    this.optionalEdit = this.thirdFormGroup.valid

    if( this.optionalEdit ){
      // console.log('jump to done')
      //  this.doneStep.select()
       this.step = 3
    }
  }

  searchZd(){
    this.secondFormGroup.get('userSelected').reset() 

    if( this.firstFormGroup.get('byTicket').value ){
      this.searchZdByTicket( this.firstFormGroup.get('inputVal').value )
    }else{
      this.searchZdByUser( this.firstFormGroup.get('inputVal').value )
    }
  }

  searchZdByUser( v ){
    this.loading['search'] = true
    this.usersFound = []

    this._api.restfulPut( {mail: v}, 'Calls/searchUser' )
                .subscribe( res => {

                  this.loading['search'] = false
                  this.usersFound = res['data']

                }, err => {
                  this.loading['search'] = false;
                  this.step = 0

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });
  }

  searchZdByTicket( v ){
    this.loading['search'] = true
    this.usersFound = []

    this._api.restfulGet( v, 'Calls/viewTicketSide' )
                .subscribe( res => {

                  this.loading['search'] = false
                  this.usersFound = res['data']['data']['users']

                }, err => {
                  this.loading['search'] = false;
                  this.step = 0

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });
  }
  
  getErrorMessage( ctrl, form: FormGroup ) {

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

  edit(){
    this.step = 2
  }

  create(){

    let newUser = {
      email:  this.firstFormGroup.get('inputVal').value,
      name:   '',
      phone:  '',
      user_fields: {
        idioma_cliente: '',
        nacionalidad:   '',
        whatsapp:       '',
      }
    }
    
    this.secondFormGroup.get('userSelected').setValue( newUser )
    this.step = 2

  }

  createSaveZdUser(){

    if( this.thirdFormGroup.invalid ){
      return false
    }

    this.loading['update'] = true
    
    let params = {
      email:  this.thirdFormGroup.get('email').value,
      name:   this.thirdFormGroup.get('name').value,
      phone:  this.thirdFormGroup.get('phone').value,
      user_fields: {
        idioma_cliente: this.thirdFormGroup.get('idioma_cliente').value,
        nacionalidad:   this.thirdFormGroup.get('nacionalidad').value,
        whatsapp:       this.thirdFormGroup.get('whatsapp').value,
      }
    }

    this._api.restfulPut( params, 'Calls/createUpdateUser' )
                .subscribe( res => {

                  this.loading['update'] = false

                  if( res['data']['response'] >= 200 && res['data']['response'] < 300 ){
                    this.secondFormGroup.get('userSelected').setValue( res['data']['data']['user'] )
                    this.validateUser()
                  }else{
                    this._init.snackbar('error', 'Ocurrio un error al guardar los datos', 'Cerrar')
                    this.step = 2
                  }

                }, err => {
                  this.loading['update'] = false;
                  this.step = 2

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });
  }
}
