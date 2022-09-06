import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService, AvalonService, HelpersService, InitService } from 'src/app/services/service.index';
import Swal from 'sweetalert2';

import { EditZdDialog } from '../../modals/edit-zd-dialog/edit-zd-dialog';
import { ManageInsDialog } from '../../modals/manage-ins/manage-ins.dialog';
import { PagosDialog } from '../../modals/pagos-modal/pagos-modal';

@Component({
  selector: 'app-loc-sum',
  templateUrl: './loc-sum.component.html',
  styleUrls: ['../main-frame/main-frame.component.css']
})
export class LocSumComponent implements OnInit {

  @Input() data = {}

  @Input() hideInsXld
  @Output() hideInsXldChange = new EventEmitter()

  @Output() reload = new EventEmitter
  @Output() reloadHistory = new EventEmitter
  @Output() avalon = new EventEmitter

  loading = {}

  ccFlag = false

  showMore = false
  
  constructor(
    public _init: InitService,
    public _h: HelpersService,
    private _api: ApiService,
    private _avalon: AvalonService,
    public domSanitizer: DomSanitizer,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  changeHide(){
    this.hideInsXld = !this.hideInsXld
    this.hideInsXldChange.emit( this.hideInsXld )
  }

  urlCopy( d ){
    return `https://cyc-oasishoteles.com/api/rf/index.php/Rsv/verConfirmacion/${d['masterlocatorid']}/${encodeURIComponent(d['correoCliente'])}`
  }

  // **************************** APIS INICIO ****************************

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

    sendMailConfirm(){
      this.loading['sendConf'] = true
  
      this._api.restfulPut( {loc: this.data['master']['masterlocatorid'] }, 'Rsv/sendFullConf' )
                  .subscribe( res => {
  
                    this.loading['sendConf'] = false;
                    this._init.snackbar('success', res['msg'], 'Enviado' );
                    this.reloadHistory.emit( true )
                  }, err => {
                    this.loading['sendConf'] = false;
  
                    const error = err.error;
                    this._init.snackbar('error', error.msg, err.status );
                    console.error(err.statusText, error.msg);
  
                  });
    }

    sendAuthFormat( i ){

        Swal.fire({
          icon: 'warning',
          title: 'Realmente deseas enviar el formato de autorización a este cliente?',
          showCancelButton: true,
          confirmButtonText: 'Enviar Formato',
          allowOutsideClick: false,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            this.sendAuthFormatApi( i )
          }
        })
    }

    sendAuthFormatApi( i ){

      Swal.fire({
        title: 'Enviando Formato de Autorizacion de Cargo',
        allowOutsideClick: false,
        })
      Swal.showLoading()
  
      this._api.restfulPut( { ml: i['masterlocatorid'] }, 'Zendesk/sendAuthFormat' )
                  .subscribe( res => {
  
                    Swal.close()
                    
                    this._init.snackbar('success', res['msg'], 'Enviado' );
                    this.reloadHistory.emit( true )
        
                  }, err => {
                    Swal.close()
  
                    const error = err.error;
                    this._init.snackbar('error', error.msg, err.status );
                    console.error(err.statusText, error.msg);
  
                  });
    }
  
  // **************************** APIS FIN ****************************


  // **************************** DIALOGS INICIO ****************************

    manageIns(){
      if( this.data['master']['esNacional'] == null ){
        this._init.snackbar( 'error', 'Por favor edita la nacionalidad del cliente para continuar.', 'Nacionalidad no identificada')
        this.zdEditDialog( this.data['master'] )
      }else{
        this.insuranceDialog( this.data )
      }

      return true;
    }
  
    pagosDialog( d:any = null ): void {
      const dialogRef = this.dialog.open(PagosDialog, {
        data: d,
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        if( result === true ){
          this.reloadHistory.emit( true )
        }
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

    insuranceDialog( d:any = null ): void {
      const dialogRef = this.dialog.open(ManageInsDialog, {
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
