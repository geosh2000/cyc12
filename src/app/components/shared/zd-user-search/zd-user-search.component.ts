import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatStep, MatStepper, StepperOrientation } from '@angular/material/stepper';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ApiService, InitService } from 'src/app/services/service.index';
import { ZdUserEditComponent } from '../zd-user-edit/zd-user-edit.component';


@Component({
  selector: 'app-zd-user-search',
  templateUrl: './zd-user-search.component.html',
  styleUrls: ['./zd-user-search.component.css']
})
export class ZdUserSearchComponent implements OnInit {

  @ViewChild('selectedUserForm') selUserForm: ElementRef;
  @ViewChild('zdUserSearchStepper') userSearchStepper: MatStepper;
  @ViewChild('doneStep') doneStep: MatStep;
  @ViewChild(ZdUserEditComponent, {static: false}) _edit: ZdUserEditComponent;

  @Output() selected = new EventEmitter<any>()

  loading = {}
  usersFound = []
  userSelected = {}

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
    user:           ['', Validators.required ]
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


    this.step = e.selectedIndex

    switch( e.selectedIndex ){
      case 1:
        if( e.previouslySelectedIndex < 1 ){
          this.searchZd()
        }
        break
      case 2:
        if( e.previouslySelectedIndex == 1 ){
          // this.validateUser()
          this._edit.validateUser( this.secondFormGroup.get('userSelected').value )
          this.optionalEdit = this._edit.optionalEdit
        }

        if( e.previouslySelectedIndex == 3 ){
          this._edit.userForm.get('zdId').setValue( this.userSelected['zdId'] )
        }

        if( this.usersFound.length == 0 ){
          this.secondFormGroup.reset()
        }

        break
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

                  for( let u of res['data'] ){
                    if( u['role'] == 'agent' || u['tags'].includes('noedit') ){
                      u['noeditable'] = true
                    }
                  }
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

                  for( let u of res['data']['data']['users'] ){
                    if( u['role'] == 'agent' || u['tags'].includes('noedit') ){
                      u['noeditable'] = true
                    }
                  }
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
      return 'Formato con +###########';
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

  select(){
    this.selected.emit(this.userSelected)
  }

  async goToStep(e  ){
    let flag = false

    if( e[0] == true ){
      if( e[1] == 3 ){
        this.userSelected = e[2]['userForm'].value

        flag = await this.optionalChange( true, e[2]['userForm'].value )


        setTimeout( () => {
          this.doneStep.select()
        },500)


      }else{
        this.step = e[1]
      }
    }
  }

  optionalChange( f, u ){

    return new Promise<boolean> ( resolve => {
      this.optionalEdit = f
      this.secondFormGroup.get('userSelected').setValue( this.userSelected )

      resolve( f )
    })
  }
}
