import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ActivationEnd, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { InitService } from '../services/init.service';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthComGuard implements CanActivate, CanLoad {

  cred = ''

  constructor( private _login: LoginService, private _init: InitService, private router: Router ){

        
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      let flag = this._login.validateToken()

      if( !flag ){
        this.router.navigateByUrl('/grupos/login')
      }
      
      return flag
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
              if( this._init.isLogin && this._init.currentUser != null  ){
                this.router.navigateByUrl('/notAllowed')
              }else{
                this.router.navigateByUrl('/blank')
              }
            }
          })
        )

  }
}

