import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService, InitService, WebSocketService } from 'src/app/services/service.index';

@Component({
  selector: 'app-ticket-widget',
  templateUrl: './ticket-widget.component.html',
  styleUrls: ['./ticket-widget.component.css']
})
export class TicketWidgetComponent implements OnInit, OnDestroy, AfterViewInit {

  ticket$: Subscription;
  loading = {}
  status = {
            status: 'offline',
            icon: 'highlight_off',
            title: 'Desconectado'
          }

  constructor( private _ws: WebSocketService, private _api: ApiService, private _init: InitService  ) { }

  ngOnInit(): void {

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if( !currentUser ){ return; }

    this.ticket$ = this._ws.ticket(currentUser.hcInfo.zdId).subscribe(
      msg => {

        console.log( 'status recibido', msg)

      })
  }

  ngOnDestroy(){
    this.ticket$.unsubscribe()
  }

  ngAfterViewInit(): void {
    // this.getStatus()    
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
