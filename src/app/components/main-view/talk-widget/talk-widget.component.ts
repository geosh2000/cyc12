import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService, InitService, WebSocketService } from 'src/app/services/service.index';

@Component({
  selector: 'app-talk-widget',
  templateUrl: './talk-widget.component.html',
  styleUrls: ['./talk-widget.component.css']
})
export class TalkWidgetComponent implements OnInit, OnDestroy, AfterViewInit {

  talk$: Subscription;
  loading = {}
  status = {
            status: 'offline',
            icon: 'highlight_off',
            title: 'Desconectado'
          }

  constructor( private _ws: WebSocketService, private _api: ApiService, private _init: InitService  ) { }

  ngOnInit(): void {

    this.talk$ = this._ws.talk().subscribe(
      msg => {

        // console.log( 'status recibido', msg)

        let currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if( !currentUser ){ return; }
        
        if( currentUser.hcInfo.zdId == msg['zdId'] ){
          console.log('Status: ' + msg['data']['status'] )
          this.buildStatus(msg['data']['status'])
        }
      })
  }

  ngOnDestroy(){
    this.talk$.unsubscribe()
  }

  ngAfterViewInit(): void {
    this.getStatus()    
  }

  buildStatus( st ){
    let library = {
      'online': {
        status: 'online',
        icon: 'play_circle_outline',
        title: 'Conectado'
      },
      'away': {
        status: 'away',
        icon: 'pause_circle_outline',
        title: 'Ausente'
      },
      'transfers_only': {
        status: 'transfers_only',
        icon: 'phone_callback',
        title: 'Transferencias'
      },
      'offline': {
          status: 'offline',
          icon: 'highlight_off',
          title: 'Desconectado'
      },
    }

    this.status = library[st]
  }

  
  setStatus( st ) {

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if( !currentUser ){ 
      this._init.snackbar('error', 'No existe usuario definido. Vuelve a iniciar sesión', 'Cerrar')
      return
    }

    this.loading['status'] = true;

    this._api.restfulPut( { agent: currentUser.hcInfo.zdId, status: st }, `Zendesk/setTalkStatus` )
                .subscribe( res => {

                  this.loading['status'] = false;
                  this.buildStatus( st )

                }, err => {

                  this.loading['status'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });
  }
  
  getStatus() {

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if( !currentUser ){ 
      this._init.snackbar('error', 'No existe usuario definido. Vuelve a iniciar sesión', 'Cerrar')
      return
    }

    this.loading['status'] = true;

    this._api.restfulGet( currentUser.hcInfo.zdId, `Zendesk/getTalkStatus` )
                .subscribe( res => {

                  this.loading['status'] = false;

                  if( res['data'] ){
                    if( res['data']['data']['availability'] ){
                      this.buildStatus( res['data']['data']['availability']['agent_state'] )
                      return
                    }
                  }

                  this._init.snackbar('error', "Error al obtener status de TALK", 'Cerrar')

                }, err => {

                  this.loading['status'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });
  }

}
