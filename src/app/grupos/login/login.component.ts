import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InitService, LoginService } from 'src/app/services/service.index';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  log: UntypedFormGroup

  loading = {}

  loginError:boolean = false;
  loginMsg:string = '';
  loginLoad = false

  constructor( private _login:LoginService, private _route:Router, private _init:InitService, ) { 
    this.createForm()
  }

  ngOnInit(): void {
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

  ingresar(){
    this.loading['login'] = true
    // let sourceUrl = this._router.url
    let sourceUrl = ''

    let login = {
      usn: this.log.controls['username'].value,
      usp: this.log.controls['password'].value,
      remember: this.log.controls['remember'].value,
      mainapp: this.log.controls['mainapp'].value,
    }

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
            
            // this.onNoClick()

            this._route.navigateByUrl('/grupos',res['data'])
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

}
