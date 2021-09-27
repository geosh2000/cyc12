import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { InitService } from 'src/app/services/service.index';
import { WsService } from 'src/app/services/ws.service';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css']
})
export class MainViewComponent {

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