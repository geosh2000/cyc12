import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { ZonaHorariaService } from './zona-horaria.service';
declare var jQuery:any;

@Injectable({
  providedIn: 'root'
})
export class InitService {

  preferences:any = {}
  currentUser:any
  isLogin:boolean = false
  agentName = ''
  
  token = new BehaviorSubject( false )
  snack = new BehaviorSubject( { status: false, msg: '', title: '', t: '' } )
  hideMenu = new BehaviorSubject( false )

  loadingRouteConfig = false
  app = ''

  constructor( private _route:Router, private _api:ApiService, private _zh:ZonaHorariaService ) {
    this.getPreferences()

    this._route.events.subscribe( v => {
      jQuery('.modal').modal('hide')
      this.hideMenu.next( true )
    })

    this.agentName = localStorage.getItem('nombre')
  }

  copyToClipboard( t ) {
    let d = jQuery('<input>').val(t).appendTo('body').select()
    document.execCommand('copy')
    d.remove()
  }

  getPreferences( app = '' ){

    this._api.app = app

    if( localStorage.getItem(app + 'currentUser') ){
      this.currentUser = JSON.parse(localStorage.getItem(app + 'currentUser'))
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

  getUserInfo( app = ''){
    let currentUser = JSON.parse(localStorage.getItem(app + 'currentUser'));
    this.currentUser = currentUser
    if( currentUser ){
      this.isLogin = true
    }else{
      this.isLogin = false
    }
    return currentUser
  }

  checkCredential( credential, main:boolean=false, test:boolean = false, app = '' ){
    let currentUser = JSON.parse(localStorage.getItem(app + 'currentUser'));
    if( currentUser == null){

      this.showLoginModal( )
      return false
    }

    let cred = JSON.parse(atob(currentUser.creds))

    if(cred['allmighty'] == 1 && !test){
      return true
    }

    if(cred[credential] == 1){
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

  checkSingleCredential( credential, main:boolean=false, test:boolean = false, app = '' ){

    
    
    let currentUser = JSON.parse(localStorage.getItem(app + 'currentUser'));
    if( currentUser == null){
      return false
    }
    
    let cred = JSON.parse(atob(currentUser.creds))

    if(cred['allmighty'] == 1 && !test){
      return true
    }

    if(cred[credential] == 1){
      return true
    }else{
      return false
    }

  }

  snackbar( t, title, msg ){

    // console.trace()

    this.snack.next( {
      status: true,
      msg,
      title,
      t
    } )

    setTimeout( () => {
      this.snack.next( {
        status:false,
        msg: '',
        title: '',
        t: 'error'
      })
    },1000)
  }

  

}
