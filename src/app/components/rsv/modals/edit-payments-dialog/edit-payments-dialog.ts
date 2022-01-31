import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService, HelpersService, InitService, ZonaHorariaService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';
import Swal from 'sweetalert2';


@Component({
      selector: 'edit-payments-dialog',
      templateUrl: './edit-payments-dialog.html',
      styleUrls: ['../../components/main-frame/main-frame.component.css']
  })
  export class EditPaymentDialog implements OnInit {

    loading = {}
    items = []

    constructor(
      public editPaymentDialog: MatDialogRef<EditPaymentDialog>,
      public _api: ApiService,
      public _h: HelpersService,
      private _init: InitService,
      private _zh: ZonaHorariaService,
      @Inject(MAT_DIALOG_DATA) public data) {

      }

    ngOnInit(): void {
      this.filterItems()
    }
  
    onNoClick(): void {
      this.editPaymentDialog.close( null );
    }

    filterItems(){
      let items = []

      for( let i of this.data['items'] ){
        if( i['isCancel'] == 0 && i['editablePrepay'] == 1 ){
          items.push( i )
        }
      }

      if( items.length == 0 ){
        Swal.fire('Sin Resultados', 'No existen items que permitan editar los prepagos / totales', 'info')
        this.editPaymentDialog.close( false );
      }

      this.items = items

    }

    
}
  