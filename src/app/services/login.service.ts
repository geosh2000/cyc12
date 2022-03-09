import { Injectable } from '@angular/core';
import { getMatIconFailedToSanitizeUrlError } from '@angular/material/icon';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, filter, map, tap } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { ApiService } from './api.service';
import { InitService } from './init.service';
import { WebSocketService } from './web-socket.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  co = new BehaviorSubject( null )
    
  constructor( private _api:ApiService, private _init:InitService, private ws: WebSocketService, private router: Router ) { 
    this._api.tokenCheck.asObservable()
      .subscribe(r => {
        if( !r ){
          console.error('Token Expired, please login again')
          this.logout()
          Swal.fire('Token Expired','Tu sesión ha expirado, por favor ingresa nuevamente', 'error')
        }
      })
  }

  loginCyC( logInfo ){

    // console.log(logInfo)
    return this._api.restfulPut( logInfo, 'Login/login', false ).pipe(
      
      map( res => {
        localStorage.setItem(
          'currentUser',
          JSON.stringify({
                          token: res['token'],
                          tokenExpire: res['tokenExpire'],
                          username: res['username'],
                          hcInfo: res['hcInfo'],
                          creds: btoa( JSON.stringify(res['credentials'])),
                          credentials: res['credentials']
                        })
        );
        localStorage.setItem('token', res['token'])
        localStorage.setItem('nombre', res['hcInfo']['Nombre_Corto'])
        console.log('run socket')
        this.ws.cargarStorage()
        console.log('end run socket')
        this._init.getPreferences()
        this._init.agentName = res['hcInfo']['Nombre_Corto']
        this._init.loadingRouteConfig = false

        // OBSERVER LOGIN
        this._api.newLogin.next(true);

        if( this._api.lastUrl ){
          this.router.navigate[ this._api.lastUrl ]
        }

        return { status: true, msg: 'Logueo Correcto', err: 'NA', isAffiliate: res['credentials']['viewOnlyAffiliates'] == '1' ? true : false}
      }, err => {

        if(err){
          let error = err.error
          console.error(err.statusText, error.msg)
          this._init.loadingRouteConfig = false

          return { status: false, msg: error.msg, err: err.statusText }
        }
      })
    )
      

  }

  validateToken( cred: string = '' ){

    const token = localStorage.getItem('token')
    const remember = localStorage.getItem('remember')

    return this._api.restfulPut( {token, remember}, 'Login/tokenRenew', false)
      .pipe(
        tap( (resp: any) => {
          if( resp.token['token'] ){
            localStorage.setItem('token', resp.token['token'] )
          }else{
            this.logout()
          }
        }),
        map( respo => {

          const localData = JSON.parse(localStorage.getItem('currentUser'))
          
          if( cred == '' ){
            return true
          }

          let credS = JSON.parse(atob(localData.creds))

          if( credS[cred] == "1" ){
            return true
          }else{
            return false
          }

        }),
        catchError( err => of( false ))
      )

  }

  logout(){

    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    this._init.currentUser = null
    this._init.preferences = {}
    this._init.isLogin = false
    this._init.token.next( false )
  }

  



}
