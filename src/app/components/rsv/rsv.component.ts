import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ApiService, InitService, ZonaHorariaService } from 'src/app/services/service.index';
import { MainFrameComponent } from './components/main-frame/main-frame.component';
import { SearchLocDialog } from './modals/search-loc/search-loc.component';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-rsv',
  templateUrl: './rsv.component.html',
  styleUrls: ['./rsv.component.css']
})
export class RsvComponent implements OnInit, AfterViewInit {

  @ViewChild( MainFrameComponent ) _main: MainFrameComponent;

  ml:any
  mlExist = true

  loading = {}

  data = {}
  mlTicket:any
  zdClientId:any
  rsvHistory = []

  constructor( 
    private route: ActivatedRoute,
    private _api: ApiService,
    private _init: InitService,
    private _zh: ZonaHorariaService,
    public dialog: MatDialog ) { }

  ngOnInit(): void {
    this.ml = this.route.snapshot.paramMap.get('loc');
    if( this.ml ){
      this.getLoc( this.ml )
    }
  }

  ngAfterViewInit(): void {
  }


  getLoc( l, s = '', f = ()=>void {}){

    this.loading['loc'] = true
    this.mlExist = true
    this.data = {}
    this.data['rsvHistory'] = []

    // switch( s ){
    //   case 'links':
    //     this._genL.fullReload = true
    //     break
    // }

    this._api.restfulGet( l, 'Rsv/manage2Loc' )
                .subscribe( res => {

                  this.loading['loc'] = false;

                  if( res['data']['master'] && res['data']['items'].length > 0 ){
                    let data = {
                      master: res['data']['master'],
                      items: res['data']['items']
                    }

                    data['master']['tickets'] = data['master']['tickets'] != null ? data['master']['tickets'].split(',') : []

                    // START Payment links build
                    if( data['master']['allLinks'] ){
                      let arr = JSON.parse(data['master']['allLinks'])
                      data['master']['allLinks'] = {}
                      for( let lnk of arr ){
                        data['master']['allLinks'][lnk['reference']] = lnk
                      }
                    }else{
                      data['master']['allLinks'] = {}
                    }

                    for( let i of data['items'] ){
                      if( i['referencias'] ){
                        i['referencias'] = i['referencias'].split(',')
                      }else{
                        i['referencias'] = []
                      }
                      if( i['links'] ){
                        // console.log(i['links'])
                        i['links'] = JSON.parse(i['links'])
                        i['linksMonto'] = 0
                        for( let lk of i['links'] ){
                          if( lk['active'] == 1 ){
                            i['linksMonto'] += parseFloat(lk['monto'])
                          }
                        }
                      }else{
                        i['links'] = []
                        i['linksMonto'] = 0
                      }
                      // END Payment links build
                    }

                    data['mlTicket'] = data['master']['mlTicket']
                    
                    this.data = data
                    this.zdClientId = data['master']['zdUserId']
                    this.rsvTypeCheck()

                    this.data['rsvHistory'] = []
                    this.getRsvHistory()

                    // if( !data['master']['idioma'] ){
                    //   this._updU.open( data['master'] )
                    // }

                    // switch( s ){
                    //   case 'links':
                    //     this._genL.open( data )
                    //     this._genL.fullReload = false
                    //     break
                    // }
                  }else{

                    this.mlExist = false

                    this.data = {
                      master: {},
                      items: []
                    }
                  }

                  // for( let i of this.data['items'] ){
                  //   if( i['itemType'] == 1 && i['insuranceRelated'] != null){
                  //     this._ins.reviewConsistence( this.data )
                  //     return 
                  //   }
                  // }

                  f()




                }, err => {
                  this.loading['loc'] = false;

                  const error = err.error;
                  this.mlExist = true
                  console.error(err.statusText, error.msg);
                  this._init.snackbar('error', err.statusText, error.msg )

                  return false

                });

  }

  getRsvHistory( zdClientId = this.zdClientId ){

    this.data['rsvHistory']['loading'] = true

    this._api.restfulGet( zdClientId, 'Rsv/getRsvHistory' )
                .subscribe( res => {

                  this.data['rsvHistory']['loading'] = false;
                  let rh = []

                  this.data['rsvHistory'] = res['data']

                }, err => {
                  this.data['rsvHistory']['loading'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  rsvTypeCheck(){
    let x = 0   // Total de items
    let c = 0   // Items cancelados
    let e = 0   // Items expirados
    let a = 0   // Items Activos
    let rt = 'Cotizacion'

    for( let i of this.data['items'] ){
      x++
      if( i['isQuote'] == 0 && i['isCancel'] == 0 ){
        rt = 'Reserva'
      }

      if( i['isQuote'] == 1 && i['isCancel'] == 0 ){
        if( moment.tz(i['vigencia'],this._zh.defaultZone).tz(this._zh.zone) < moment() ){
          e++
        }
      }

      if( i['isCancel'] == '1' ){
        c++
      }else{
        a++
      }
    }

    if( c == x ){
      rt = 'Cancelada'
    }

    if( e == a ){
      rt = 'Expirada'
    }

    this.data['rsvType'] = rt
  }


  // DIALOGS

  searchLocDialog( d:any = null ): void {
    const dialogRef = this.dialog.open(SearchLocDialog, {
      data: d,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed', result);
    });
  }

}
