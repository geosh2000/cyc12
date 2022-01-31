import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService, HelpersService, InitService, ZonaHorariaService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';


@Component({
      selector: 'reactivate-dialog',
      templateUrl: './reactivate-dialog.html',
      styleUrls: ['../../components/main-frame/main-frame.component.css']
  })
  export class ReactivateDialog implements OnInit {

    loading = {}
    expired = []

    constructor(
      public reactivateDialog: MatDialogRef<ReactivateDialog>,
      public _api: ApiService,
      public _h: HelpersService,
      private _init: InitService,
      private _zh: ZonaHorariaService,
      @Inject(MAT_DIALOG_DATA) public data) {

      }

    ngOnInit(): void {
      this.filterExp()
    }
  
    onNoClick(): void {
      this.reactivateDialog.close( null );
    }

    filterExp(){
      let expired = []

      for( let i of this.data['items'] ){
        if( !this._h.isVigente(i['vigencia']) && i['isCancel'] == 0 && i['isQuote'] == 1 ){
          expired.push( i )
        }
      }

      if( expired.length == 0 ){
        this.reactivateDialog.close( false );
      }

      this.expired = expired
    }

    reactivate( items ){
      let ri = []

      for( let i of items ){
        ri.push( i.value )
      }

      this.loading['reactivate'] = true

      this._api.restfulPut( { itemId: ri }, 'Rsv/reactivate' )
                  .subscribe( res => {

                    this.loading['reactivate'] = false;
                    this._init.snackbar( 'success', 'Actualizado', res['msg'] );
                    this.reactivateDialog.close( true );

                  }, err => {
                    this.loading['reactivate'] = false;

                    const error = err.error;
                    
                    this._init.snackbar( 'error', error.msg, err.status );
                    console.error(err.statusText, error.msg);
                    
                    if( error.error === true ){
                      this.reactivateDialog.close( 'false-reload' );
                    }

                    if( error.error === false ){
                      this.reactivateDialog.close();
                    }
                    

                  });

    }

  
  
}
  