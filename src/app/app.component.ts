import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { InitService } from './services/service.index';
import { WsService } from './services/ws.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'cycOasis';
  sb_open = false;

  constructor( public _init: InitService, 
    private _ws: WsService,
    private router: Router,) { }

  ngOnInit(): void {
    this._init.hideMenu.subscribe( v => this.sb_open = !v )

    this.router.events.subscribe((val) => {
      if( val instanceof NavigationEnd ){
        this._ws.setUrl( val.urlAfterRedirects + ' -- ' + window.navigator.userAgent )
      }
    });
  }

  menuChange(){
    console.log('Menu clicked', !this.sb_open)
    this.sb_open = !this.sb_open
  }


}

