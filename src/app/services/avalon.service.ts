import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { map, share } from 'rxjs/operators'
import { BehaviorSubject } from 'rxjs';

declare global {
  interface Window {
    RTCPeerConnection: RTCPeerConnection;
    mozRTCPeerConnection: RTCPeerConnection;
    webkitRTCPeerConnection: RTCPeerConnection;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AvalonService {


  serverTest:boolean = false
  apiKey: 'db6a5e1fdc5f4612a39466ba073ef72fbee48be2b30d402c8c8b0a14c31264a6'
  portTest:string = ':81'
  // baseUrl:string = 'http://avalon.oasishoteles.ohr'
  baseUrl:string = 'https://avalon-prod-alb-836657652.us-east-1.elb.amazonaws.com'
  apiRoute:string = '/AWWebAPI/api/aw/'
  // apiUrl:string = `http://avalon.oasishoteles.ohr:81/AWWebAPI/api/aw/`;
  apiUrl:string = '';

  methods = {
    'getReservation': { dir: 'oasis', method: 'GetReservations' },
    'postReservation': { dir: 'oasis', method: 'PostReservation' },
  }

  globals = {
    estados: {
      '0': 'Confirmado',
      '1': 'En casa',
      '2': 'Checkout',
      '3': 'NoShow',
      '4': 'Cancelada',
    }
  }

  constructor(
                private http:HttpClient,
                private domSanitizer:DomSanitizer
              ) {
      
      // INITIALIZE APIURL
      this.apiUrl = `${ this.baseUrl }${ this.serverTest ? this.portTest : '' }${ this.apiRoute }`
  }

  transform( url: string): any {
    return this.domSanitizer.bypassSecurityTrustUrl( url );
  }

  getRoute( m ){
    return this.methods[m]['dir'] + '/' + this.methods[m]['method']
  }

  restfulPut( params, apiRoute, loginReq = true ){

    let url = `${ this.apiUrl }${ this.getRoute( apiRoute ) }`

    let body = JSON.stringify( params );
    let headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json').set('x-api-key', this.apiKey)

    // return this.http.put( urlOK.changingThisBreaksApplicationSecurity, body, { headers } )
    return this.http.put( url, body, { headers } )
        .pipe(
           share(),
           map( res => res )
        )
  }

  restfulPost( params, apiRoute ){

    let url = `${ this.apiUrl }${ this.getRoute( apiRoute ) }`
    let headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json').set('x-api-key', this.apiKey)

    let urlOK = this.transform( url )

    let body = JSON.stringify( params );


    return this.http.post( urlOK.changingThisBreaksApplicationSecurity, body, { headers } )
        .pipe(
           map( res => res )
        )
  }

  xmlPost( params, apiRoute ){

    let url = `${ this.apiUrl }${ this.getRoute( apiRoute ) }`
    let headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json').set('x-api-key', this.apiKey)

    let urlOK = this.transform( url )

    let body = params;


    return this.http.post( urlOK.changingThisBreaksApplicationSecurity, body, { headers } )
        .pipe(
           map( res => res )
        )
  }

  restfulGet( params, apiRoute ){

    let query = '?'
    for( let p in params ){
      query += `${ p }=${ params[p] }&`
    }

    let url = `${ this.apiUrl }${ this.getRoute( apiRoute ) }${ query }`
    
    let urlOK = this.transform( url )

    let headers = new HttpHeaders()
    .set("x-api-key", "db6a5e1fdc5f4612a39466ba073ef72fbee48be2b30d402c8c8b0a14c31264a6")
    .set("Content-Type", "application/xml")

    let requestOptions = {
      method: 'GET',
      headers: headers,
      redirect: 'follow'
    };

    return this.http.get( urlOK.changingThisBreaksApplicationSecurity, requestOptions )
        .pipe(
           map( res => res ),
        )
  }

}
