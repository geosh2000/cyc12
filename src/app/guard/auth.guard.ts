import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ActivationEnd, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { InitService } from '../services/init.service';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {

  cred = ''

  constructor( private _login: LoginService, private _init: InitService, private router: Router ){

        
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      
      return this._login.validateToken()
      .pipe(
        tap( isAllowed => {
          if( !isAllowed ){
            this.router.navigateByUrl('/notAllowed')
          }
        })
        )
  }
  

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {

      let role = ''

      if( route.data ){
        if( route.data.role ){
          role = route.data.role
        }
      }

      return this._login.validateToken( role )
        .pipe(
          tap( isAllowed => {

            if( !isAllowed ){
              if( this._init.isLogin && this._init.currentUser == null  ){
                this.router.navigateByUrl('/notAllowed')
              }else{
                this.router.navigateByUrl('/blank')
              }
            }
          })
        )

  }
}

