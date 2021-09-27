import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { ZonaHorariaService } from './zona-horaria.service';
declare var jQuery:any;

@Injectable()
export class InitService {

  preferences:any = {}
  currentUser:any
  isLogin:boolean = false
  
  token = new BehaviorSubject( false )
  snack = new BehaviorSubject( { status: false, msg: '', title: '', t: '' } )
  hideMenu = new BehaviorSubject( false )

  constructor( private _route:Router, private _api:ApiService, private _zh:ZonaHorariaService ) {
    this.getPreferences()

    this._route.events.subscribe( v => {
      jQuery('.modal').modal('hide')
      this.hideMenu.next( true )
    })
  }

  copyToClipboard( t ) {
    let d = jQuery('<input>').val(t).appendTo('body').select()
    document.execCommand('copy')
    d.remove()
  }

  getPreferences(){
    if( localStorage.getItem('currentUser') ){
      this._api.restfulGet( '', 'Preferences/userPreferences' )
          .subscribe( res => {
            this.preferences = res['data']
            this._zh.getZone( this.preferences['zonaHoraria'] )
          })
      this.isLogin = true
      this.token.next( true )
    }else{
      this.isLogin = false
      this.token.next( false )
    }
  }

  getUserInfo(){
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUser = currentUser
    if( currentUser ){
      this.isLogin = true
    }else{
      this.isLogin = false
    }
    return currentUser
  }

  checkCredential( credential, main:boolean=false, test:boolean = false ){
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if( currentUser == null){

      this.showLoginModal( )
      return false
    }

    if(currentUser.credentials['allmighty'] == 1 && !test){
      return true
    }

    if(currentUser.credentials[credential] == 1){
      return true
    }else{
      this.displayNoCredentials( main )
      return false
    }

  }

  showLoginModal( ){
    jQuery('#loginModal').modal('show');
  }

  displayNoCredentials( display ){
    if(display){
      jQuery('#noCredentials').modal('show');
      this._route.navigateByUrl('/home')
    }
  }

  checkSingleCredential( credential, main:boolean=false, test:boolean = false ){
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if( currentUser == null){
      return false
    }

    if(currentUser.credentials['allmighty'] == 1 && !test){
      return true
    }

    if(currentUser.credentials[credential] == 1){
      return true
    }else{
      return false
    }

  }

  snackbar( t, title, msg ){

    this.snack.next( {
      status: true,
      msg,
      title,
      t
    } )
  }

  

}
