import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationStart, ResolveEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService, InitService, WebSocketService } from 'src/app/services/service.index';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css']
})
export class MainViewComponent implements OnInit, OnDestroy {

  moduleTitle = 'cycOasis';
  sb_open = false;
  routerS$: Subscription;

  constructor( public _init: InitService, 
    public _api: ApiService,
    private _ws: WebSocketService,
    private router: Router,) { 
      this._ws.cargarStorage()
    }

  ngOnInit(): void {
    this._init.hideMenu.subscribe( v => this.sb_open = !v )

    this.routerS$ = this.router.events.subscribe((val) => {
      // console.log( val )
      if (val instanceof NavigationStart) {
        // console.log( 'start load' )
        this._init.loadingRouteConfig = true;
      }
      if( val instanceof NavigationEnd || val instanceof ResolveEnd  ){
        this._ws.setUrlWs( val.urlAfterRedirects + ' -- ' + window.navigator.userAgent )
        this._init.loadingRouteConfig = false;
      }
      if( val instanceof NavigationCancel  ){
        this._ws.setUrlWs( val.url + ' -- ' + window.navigator.userAgent )
        this._init.loadingRouteConfig = false;
      }
    });

  }

  ngOnDestroy(){
  }

  menuChange(){
    this.sb_open = !this.sb_open
  }


}