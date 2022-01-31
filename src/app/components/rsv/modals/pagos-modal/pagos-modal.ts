import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService, InitService } from 'src/app/services/service.index';


@Component({
      selector: 'pagos-modal',
      templateUrl: './pagos-modal.html',
      styleUrls: ['./pagos-modal.css']
  })
  export class PagosDialog implements OnInit {

    pagos = []
    loading = {}

    changed = false

    constructor(
      public pagosDialog: MatDialogRef<PagosDialog>,
      public _api: ApiService,
      private _init: InitService,
      @Inject(MAT_DIALOG_DATA) public data) {

      }

    ngOnInit(): void {
        this.getPayments()
    }
  
    onNoClick(): void {
      this.pagosDialog.close( this.changed );
    }

    getPayments(){

      this.loading['pagos'] = true
  
      this._api.restfulPut( { loc: this.data }, 'Rsv/getPayments' )
                  .subscribe( res => {
  
                    this.loading['pagos'] = false;
                    this.pagos = res['data']
  
                  }, err => {
                    this.loading['pagos'] = false;
  
                    const error = err.error;
                    this._init.snackbar( 'error', error.msg, err.status );
                    console.error(err.statusText, error.msg);
  
                  });
    }
      
    applyPayments( id ){

      this.loading['apply'] = true
  
      this._api.restfulPut( { itemId: id }, 'Rsv/applyPaymentsCielo' )
                  .subscribe( res => {
  
                    this.loading['apply'] = false;
                    this._init.snackbar( 'success', 'Aplicadas', res['msg'] );
                    this.getPayments()

                    this.changed = true
  
                  }, err => {
                    this.loading['apply'] = false;
  
                    const error = err.error;
                    this._init.snackbar( 'error', error.msg, err.status );
                    console.error(err.statusText, error.msg);
  
                  });
    }
      
  
}
  