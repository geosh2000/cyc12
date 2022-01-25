import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService, InitService } from 'src/app/services/service.index';
import { ZdUserEditComponent } from 'src/app/shared/zd-user-edit/zd-user-edit.component';


@Component({
      selector: 'edit-zd-dialog',
      templateUrl: './edit-zd-dialog.html',
      styleUrls: ['./edit-zd-dialog.css']
  })
  export class EditZdDialog implements OnInit, AfterViewInit {

    @ViewChild(ZdUserEditComponent) _zd: ZdUserEditComponent;

    loading = {}

    constructor(
      public editZdDialog: MatDialogRef<EditZdDialog>,
      private _api: ApiService,
      private _init: InitService,
      @Inject(MAT_DIALOG_DATA) public data) {

      }

    ngOnInit(): void {
      // this.init()
    }
  
    ngAfterViewInit(): void {
        this.init()
    }
  
    onNoClick( f = false ): void {
      this.editZdDialog.close( f );
    }

    async init(){
      
      let u = await this.searchZdByUser( this.data['zdUserId'] )

      this._zd.validateUser( u, this.data['masterlocatorid'], null, false )

    }

    searchZdByUser( v ){
      this.loading['search'] = true

      return new Promise<any> ( resolve => {
        this._api.restfulPut( {id: v}, 'Calls/searchUser' )
                    .subscribe( async res => {
    
                      this.loading['search'] = false
    
                      if( res['data']['role'] == 'agent' || res['data']['tags'].includes('noedit') ){
                        res['data']['noeditable'] = true
                      }
  
                      resolve(res['data'])
    
                    }, err => {
                      this.loading['search'] = false;

                      resolve( false )
    
                      const error = err.error;
                      this._init.snackbar('error', error.msg, 'Cerrar')
                      console.error(err.statusText, error.msg);
    
                    });
      })
  
    }

}
  