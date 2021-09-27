import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { LoginService, InitService } from '../../services/service.index';
declare var jQuery:any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  log: FormGroup

  loading = {}

  loginError:boolean = false;
  loginMsg:string = '';
  loginLoad = false

  constructor( private _login:LoginService, private _route:Router, private _init:InitService ) { 
    this.createForm()
  }

  ngOnInit() {

  }

  createForm(){

    this.log =  new FormGroup({
      ['username']:   new FormControl({ value: '',  disabled: false }, [ Validators.required ]),
      ['password']:   new FormControl({ value: '',  disabled: false }, [ Validators.required ]),
      ['remember']:   new FormControl({ value: false,  disabled: false }, [ Validators.required ])
    })

  }

  validate( item ){
    console.log(item);
  }

  open(){
    jQuery('#loginModal').show()
  }

  logIn( ){
    this.loading['login'] = true
    let sourceUrl = this._route.url

    let login = {
      usn: this.log.controls['username'].value,
      usp: this.log.controls['password'].value,
      remember: this.log.controls['remember'].value
    }

    console.log(login)
    console.log(this.log.value)
    console.log(this.log.controls['username'].value)

    // console.log(this.login)
    this._login.loginCyC( login )
      .subscribe( res =>{

          this.loading['login'] = false

          if( res['ERR'] ){
            this.loginError=true;
            this.loginMsg=res.msg;
          }else{
            this.loginError=false;
            this.loginMsg='';
            jQuery('#loginModal').modal('hide');

            if( res['isAffiliate'] ){
              this._route.navigateByUrl('/afiliados')
            }else{
              this._route.navigateByUrl('/home')
              this._route.navigateByUrl(sourceUrl)
            }
            this._init.getPreferences()

        }
      }, err => {

        if(err){
          this.loading['login'] = false
          let error = err.error
          this.loginError=true;
          this.loginMsg=error.msg;

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
