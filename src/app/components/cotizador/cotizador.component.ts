import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { ApiService, InitService } from 'src/app/services/service.index';

@Component({
  selector: 'app-cotizador',
  templateUrl: './cotizador.component.html',
  styleUrls: ['./cotizador.component.css']
})
export class CotizadorComponent implements OnInit {

  loading = {}
  products = []
  displayModule = 'hotel'

  constructor( 
      private ttl: Title, 
      private _api: ApiService, 
      private toastr: ToastrService, 
      public dialog: MatDialog,
      public _init: InitService 
    ) { }

  ngOnInit(): void {
    this.ttl.setTitle('CyC - Cotizador');
    this.getServices()
  }

  matChange( e ){

    this.displayModule = this.products[ e.index ]['title'].toLowerCase()
    
  }

  rsv( e ){
    console.log( e )

    switch( e['action'] ){
      case 'doRsv':
        this.rsvDialog( e['data'] )
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
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  rsvDialog( d:any ): void {
    const dialogRef = this.dialog.open(RsvCreateDialog, {
      // width: '250px',
      data: d,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
    });
  }


}

@Component({
  selector: 'create-rsv',
  templateUrl: '/modals/create-rsv.html',
})
export class RsvCreateDialog {

  constructor(
    public rsvDialog: MatDialogRef<RsvCreateDialog>,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.rsvDialog.close();
  }

}
