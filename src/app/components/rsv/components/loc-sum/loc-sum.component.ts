import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService, HelpersService, InitService } from 'src/app/services/service.index';

import { EditZdDialog } from '../../modals/edit-zd-dialog/edit-zd-dialog';
import { PagosDialog } from '../../modals/pagos-modal/pagos-modal';

@Component({
  selector: 'app-loc-sum',
  templateUrl: './loc-sum.component.html',
  styleUrls: ['../main-frame/main-frame.component.css']
})
export class LocSumComponent implements OnInit {

  @Input() data = {}
  @Output() reload = new EventEmitter

  loading = {}

  ccFlag = false

  constructor(
    public _init: InitService,
    public _h: HelpersService,
    private _api: ApiService,
    public domSanitizer: DomSanitizer,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  // **************************** DIALOGS INICIO ****************************

    updateOr(){
      this.loading['orUpdate'] = true

      this._api.restfulPut( { masterlocatorid: this.data['master']['masterlocatorid'] }, 'Rsv/updateORewardsUser' )
                  .subscribe( res => {

                    this.loading['orUpdate'] = false;
                    this.data['master']['orId'] = res['data']['orId']
                    this.data['master']['orLevel'] = res['data']['orLevel']
                    this._init.snackbar('success', 'Actualizado', res['msg'] );

                  }, err => {
                    this.loading['orUpdate'] = false;

                    const error = err.error;
                    this._init.snackbar( 'error', error.msg, err.status );
                    console.error(err.statusText, error.msg);

                  });
    }
  
  // **************************** DIALOGS INICIO ****************************


  // **************************** DIALOGS INICIO ****************************

    pagosDialog( d:any = null ): void {
      const dialogRef = this.dialog.open(PagosDialog, {
        data: d,
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        // console.log('The dialog was closed', result);
      });
    }

    zdEditDialog( d:any = null ): void {
      const dialogRef = this.dialog.open(EditZdDialog, {
        data: d,
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        if( result ){
          this.reload.emit( this.data['master']['masterlocatorid'] )
        }
      });
    }

  // **************************** DIALOGS FIN ****************************

}
