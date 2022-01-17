import { EventEmitter, Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { Router } from '@angular/router';
import { Usuario } from '../classes/Usuarios';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService extends Socket {

  callback: EventEmitter<any> = new EventEmitter();

  public socketStatus = false;
  public usuario: Usuario;
  public router: Router;

  constructor() { 
    super({
      // url: 'http://localhost:5000/'
      url: 'https://cyc-socket.herokuapp.com'
    })

  }

  checkStatus() {

    console.log(this.ioSocket.connected)
    this.ioSocket.on('connect', () => {
      this.cargarStorage();
      console.log('Conectado al servidor');
      this.socketStatus = true;
    });

    this.on('disconnect', () => {
      console.log('Desconectado al servidor');
      this.socketStatus = false;
    });

  }

  emitWs( evento: string, payload?: any, callback?: Function ) {

    // console.log('Emitiendo', evento, payload);

    let e = this.ioSocket.emit( evento, payload, callback );

    // console.log( e )

    if( !e.connected ){
      console.log(this.ioSocket.connected)
    }

  }


  listen( evento: string ) {

    return this.fromEvent( evento );
    // this.ioSocket.on( evento, res => this.callback.emit(res) ) 

  }

  loginWS( nombre: string ) {

    return new Promise<void>( (resolve, reject ) => {

      this.emitWs( 'configurar-usuario', { nombre }, res => {

        this.usuario = new Usuario( nombre );
        this.guardarStorage();

        resolve();

      });

    });


  }

  setTicket( ticket: string ) {

    return new Promise<void>( (resolve, reject ) => {

      this.emitWs( 'activar-ticket', { ticket }, res => {

        this.usuario = new Usuario( ticket );
        // this.guardarStorage();

        resolve();

      });

    });


  }


  guardarStorage() {

    // console.log( 'save storage', this.usuario )
    localStorage.setItem( 'usuario', JSON.stringify( this.usuario ) );

  }

  cargarStorage() {

    if ( localStorage.getItem( 'currentUser' ) ) {
      this.usuario = JSON.parse( localStorage.getItem( 'currentUser' ) );
      this.loginWS( this.usuario['username'] )
      this.setUrlWs( )
    }

  }

  getUsuario(){

    return this.usuario;

  }

  logoutWS() {
    this.usuario = null;
    localStorage.removeItem( 'usuario' );

    const payload = { nombre: 'Unknown' };
    return new Promise<void>( (resolve, reject ) => {

      this.emitWs( 'configurar-usuario', payload , res => {

        localStorage.removeItem( 'usuario' );

        resolve();

      });

    });

  }

  // setUrlWs( url: string = window.location.origin ) {
    setUrlWs( url: string = window.location.href + ' -- ' + window.navigator.userAgent ) {

      return new Promise<void>( (resolve, reject ) => {
  
        this.emitWs( 'desde-url', { url }, res => {
  
          this.usuario = new Usuario( url );
          this.guardarStorage();
  
          resolve();
  
        });
  
      });
  
  
    }

  talk() {
    // return this.listen( '373677886491' );
    return this.listen( 'talk' );
  }

  confirmation( i = '') {
    let item = i != '' ? `-${i}` : ''
    return this.listen( 'rsv-confirmation' + item );
  }
  
  ticket( id ) {
    return this.listen( id );
  }


}
