import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { InitService } from 'src/app/services/service.index';
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

  constructor( private _init: InitService) { 
    
  }

  ngOnInit(): void {
    this._init.token.subscribe( t => {

      console.log( "token", t )
      this.token = t

      if( !t ){
        console.log( "show modal" )
        jQuery('#loginModal').modal('show')
      }
    })

  }

  menuClick(){
    this.menuChange.emit( true )
  }

  login(){
    jQuery('#loginModal').show()
  }
  
  logout(){
      localStorage.removeItem('currentUser');
      this._init.currentUser = null
      this._init.preferences = {}
      this._init.isLogin = false
      this._init.token.next( false )
  }

}
