import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService, InitService } from 'src/app/services/service.index';

@Component({
  selector: 'app-show-item-payments-dialog',
  templateUrl: './show-item-payments-dialog.html',
  styleUrls: ['./show-item-payments-dialog.css']
})
export class ShowItemPaymentsDialog implements OnInit {

  pagos = []
  loading = {}

  constructor(
    public pagosDialog: MatDialogRef<ShowItemPaymentsDialog>,
    public _api: ApiService,
    private _init: InitService,
    @Inject(MAT_DIALOG_DATA) public data) {

    }

  ngOnInit(): void {
    this.getPayments()
  }

  onNoClick(): void {
    this.pagosDialog.close();
  }

  getPayments(){

    this.loading['pagos'] = true

    this._api.restfulPut( { itemId: this.data['itemId'] }, 'Rsv/getItemPayments' )
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

}
