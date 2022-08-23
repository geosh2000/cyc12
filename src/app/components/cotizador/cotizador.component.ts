import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ApiService, InitService } from 'src/app/services/service.index';
import { CotizaHotelComponent } from './hotel/hotel.component';
import { RsvCreateDialog } from './modals/create-rsv';
import { SendQuoteComponent } from './modals/send-quote/send-quote.component';

@Component({
  selector: 'app-cotizador',
  templateUrl: './cotizador.component.html',
  styleUrls: ['./cotizador.component.css']
})
export class CotizadorComponent implements OnInit {

  @ViewChild(CotizaHotelComponent,{static:false}) _hotel:CotizaHotelComponent;

  loading = {}
  products = []
  displayModule = 'hotel'

  constructor( 
      private ttl: Title, 
      private _api: ApiService, 
      public dialog: MatDialog,
      public _init: InitService 
    ) { }

  ngOnInit(): void {
    this.ttl.setTitle('CyC - Cotizador');
    this.getServices()
  }

  matChange( e ){

    // console.log( e, this.products )

    this.displayModule = this.products[ e.index ]['title'].toLowerCase()

    // console.log(this.displayModule)
    
  }

  rsv( e ){
    // console.log( e )

    switch( e['action'] ){
      case 'doRsv':
        this.rsvDialog( e['data'], e['r'] ?? null, e['user'] ?? null )
        break;
      case 'doQuote':
        this.quoteDialog( e['data'] )
        break;
    }
  }

  getServices(){
    this.loading['services'] = true

    this._api.restfulGet( '', 'Rsv/getServices' )
                .subscribe( res => {

                  this.loading['services'] = false;

                  this.products = res['data']

                }, err => {
                  this.loading['services'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });
  }

  rsvDialog( d:any, r = null, user = null ): void {

    const dialogRef = this.dialog.open(RsvCreateDialog, {
      // width: '250px',
      data: d,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {

      console.log( 'dialog closed', result )

      if( result['recalc'] ){
        r['userSelected'] = result['user']
        this._hotel.selectedLevel = result['level']
        this._hotel.doRsv( r )
      }
      // console.log('The dialog was closed', result);
    });
  }

  quoteDialog( d:any ): void {
    const dialogRef = this.dialog.open(SendQuoteComponent, {
      // width: '250px',
      data: d,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed', result);
    });
  }

  

}

