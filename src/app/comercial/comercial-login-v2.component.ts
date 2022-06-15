import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ApiService, InitService, LoginService } from '../services/service.index';

@Component({
  selector: 'comercial-login',
  templateUrl: 'comercial-login-v2.component.html',
})
export class ComercialLoginDialog {

  log: UntypedFormGroup

  loading = {}

  loginError:boolean = false;
  loginMsg:string = '';
  loginLoad = false

  constructor(
    private _login:LoginService, private _route:Router, private _init:InitService,
    public dialogRef: MatDialogRef<ComercialLoginDialog>,
    @Inject(MAT_DIALOG_DATA) public data) {
      this.createForm()
    }
  
  ngOnInit(){
    // this.loading = this._login.loading
    // this.log = this._login.log
    // console.log(this._login)
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  createForm(){

    this.log =  new UntypedFormGroup({
      ['username']:   new UntypedFormControl({ value: localStorage.getItem('username') || '',  disabled: false }, [ Validators.required ]),
      ['password']:   new UntypedFormControl({ value: '',  disabled: false }, [ Validators.required ]),
      ['remember']:   new UntypedFormControl({ value: (localStorage.getItem('username') || '0') == '1',  disabled: false }, [ Validators.required ]),
      ['saveLocal']:  new UntypedFormControl({ value: localStorage.getItem('username') ? true : false,  disabled: false }, [ Validators.required ]),
      ['mainapp']:    new UntypedFormControl({ value: false,  disabled: false }, [ Validators.required ]),
    })

  }

  validate( item ){
    // console.log(item);
  }

  open(){
    // jQuery('#loginModal').show()
    console.error('Wrong open method for login')
  }

  logIn( ){
    this.loading['login'] = true
    let sourceUrl = this._route.url

    let login = {
      usn: this.log.controls['username'].value,
      usp: this.log.controls['password'].value,
      remember: this.log.controls['remember'].value,
      mainapp: this.log.controls['mainapp'].value,
    }

    // console.log(login)
    // console.log(this.log.value)
    // console.log(this.log.controls['username'].value)

    console.log( 'Login to comercial' )
    let app = 'comercial-'
    this._login.loginCyC( login, 'comercial-' )
      .subscribe( res =>{

          this.loading['login'] = false

          if( res['ERR'] ){
            this.loginError=true;
            this.loginMsg=res.msg;
          }else{
            this.loginError=false;
            this.loginMsg='';

            if( this.log.get('saveLocal').value ){
              localStorage.setItem(app + 'username', this.log.get('username').value )
            }else{
              localStorage.removeItem(app + 'username')
            }
            
            localStorage.setItem(app + 'remember', this.log.get('remember').value ? '1' : '0' )
            
            this.onNoClick()

            if( res['isAffiliate'] ){
              this._route.navigateByUrl('/afiliados')
            }else{
              this._route.navigateByUrl('/home')
              this._route.navigateByUrl(sourceUrl)
            }
            this._init.getPreferences( 'comercial-' )

        }
      }, err => {

        if(err){
          this.loading['login'] = false

          
          let error = err.error
          Swal.fire('Logueo Incorrecto', error.msg, 'error')
          console.error(err.statusText, error.msg)

        }
      });
    // console.log(this.login);
  }

  getErrorMessage( ctrl, form = this.log ) {

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

  

}
