import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService, InitService } from 'src/app/services/service.index';


@Component({
      selector: 'change-creator-dialog',
      templateUrl: './change-creator-dialog.html',
      styleUrls: ['./change-creator-dialog.css']
  })
  export class ChangeCreatorDialog implements OnInit {

    zdUsers = []
    loading = {}

    constructor(
      public chCreatorDialog: MatDialogRef<ChangeCreatorDialog>,
      private _api: ApiService,
      private _init: InitService,
      @Inject(MAT_DIALOG_DATA) public data) {

      }

    ngOnInit(): void {
      this.getZdAgents()
    }
  
    onNoClick(): void {
      this.chCreatorDialog.close();
    }

    getZdAgents(){
      this.loading['zdAgents'] = true
  
      this._api.restfulGet( '', 'Lists/assignUserList' )
                  .subscribe( res => {
  
                    this.loading['zdAgents'] = false;
                    this.zdUsers = res['data']
  
                  }, err => {
                    this.loading['zdAgents'] = false;
  
                    const error = err.error;
                    this._init.snackbar( 'error', error.msg, err.status );
                    console.error(err.statusText, error.msg);
  
                  });
    }

    selectedAg( e ){
      this.loading['chgAgent'] = true

      let params = {
        "ml" : this.data['master']['masterlocatorid'],
        "newUser" : e.value['id'],
        "newName" : e.value['Nombre'],
        "oldName" : this.data['master']['creador']
      }
  
      this._api.restfulPut( params, 'Rsv/chgAgent' )
                  .subscribe( res => {
  
                    this.loading['chgAgent'] = false;

                    this.data['master']['creador'] = e.value['Nombre']
                    this._init.snackbar( 'success', 'Nuevo creador establecido como ' + e.value['Nombre'], 'Creador Modificado' );
                    this.chCreatorDialog.close( true );
  
                  }, err => {
                    this.loading['chgAgent'] = false;
  
                    const error = err.error;
                    this._init.snackbar( 'error', error.msg, err.status );
                    console.error(err.statusText, error.msg);
  
                  });
      
    }
     
  
}
  