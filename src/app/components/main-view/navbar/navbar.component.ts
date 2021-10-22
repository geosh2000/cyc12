import { Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

import Swal from 'sweetalert2'

import { InitService, LoginService } from 'src/app/services/service.index';
import { AccountConfigComponent } from '../account-config/account-config.component';
declare var jQuery:any

@Component({
  selector: 'main-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  token = false

  @Output() menuChange = new EventEmitter<any>()
  @Output() _login = new EventEmitter<any>()

  constructor( 
    public _init: InitService,
    public dialog: MatDialog, 
    private _li: LoginService) { 
    
  }

  ngOnInit(): void {
    this._init.token.subscribe( t => {

      this.token = t

      if( !t ){
        this.loginDialog()
      }
    })

  }

  menuClick(){
    this.menuChange.emit( true )
  }

  login(){
    // jQuery('#loginModal').show()
    this.loginDialog()
  }
  
  logout(){
      this._li.logout()
  }

  loginDialog(): void {
    
    if(this.dialog.openDialogs.length==0){
      const dialogRef = this.dialog.open(LoginDialog, { disableClose: true });
      
      dialogRef.afterClosed().subscribe(result => {
        // console.log('The dialog was closed', result);
  
        // if( typeof result == 'undefined' ){
        //   this.extraInfo['grupo']['insuranceIncluded'] = true;
        // }else{
        //   this.extraInfo['grupo']['insuranceIncluded'] = result;
        // }
      });
    }

  }

  configDialog( d:any = null ): void {
    const dialogRef = this.dialog.open(AccountConfigComponent, {
      // width: '250px',
      data: d,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
    });
  }

  
}

@Component({
  selector: 'main-login',
  templateUrl: 'login-v2.component.html',
})
export class LoginDialog {

  log: FormGroup

  loading = {}

  loginError:boolean = false;
  loginMsg:string = '';
  loginLoad = false

  constructor(
    private _login:LoginService, private _route:Router, private _init:InitService,
    public dialogRef: MatDialogRef<LoginDialog>,
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

    this.log =  new FormGroup({
      ['username']:   new FormControl({ value: localStorage.getItem('username') || '',  disabled: false }, [ Validators.required ]),
      ['password']:   new FormControl({ value: '',  disabled: false }, [ Validators.required ]),
      ['remember']:   new FormControl({ value: (localStorage.getItem('username') || '0') == '1',  disabled: false }, [ Validators.required ]),
      ['saveLocal']:  new FormControl({ value: localStorage.getItem('username') ? true : false,  disabled: false }, [ Validators.required ])
    })

  }

  validate( item ){
    console.log(item);
  }

  open(){
    // jQuery('#loginModal').show()
    console.log('Wrong open method for login')
  }

  logIn( ){
    this.loading['login'] = true
    let sourceUrl = this._route.url

    let login = {
      usn: this.log.controls['username'].value,
      usp: this.log.controls['password'].value,
      remember: this.log.controls['remember'].value
    }

    // console.log(login)
    // console.log(this.log.value)
    // console.log(this.log.controls['username'].value)

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

            if( this.log.get('saveLocal').value ){
              localStorage.setItem('username', this.log.get('username').value )
            }else{
              localStorage.removeItem('username')
            }
            
            localStorage.setItem('remember', this.log.get('remember').value ? '1' : '0' )
            
            this.onNoClick()

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
