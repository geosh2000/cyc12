import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { OrderPipe } from 'ngx-order-pipe';
import { ApiService, AvalonService, HelpersService, InitService, ZonaHorariaService } from 'src/app/services/service.index';
import { ChangeCreatorDialog } from '../../modals/change-creator/change-creator-dialog';
import { expand } from 'src/app/shared/animations';

import Swal from 'sweetalert2';

import * as moment from 'moment-timezone';
import { ReactivateDialog } from '../../modals/reactivate-dialog/reactivate-dialog';
import { PaymentRegDialog } from '../../modals/payment-reg-dialog/payment-reg-dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup, NgForm } from '@angular/forms';
import { EditPaymentDialog } from '../../modals/edit-payments-dialog/edit-payments-dialog';
import { SaldarDialog } from '../../modals/saldar-dialog/saldar-dialog';
import { ModifyHotelDialog } from '../../modals/modify-hotel/modify-hotel.dialog';
import { MenuItem } from 'primeng/api';


@Component({
  selector: 'rsv-main-frame',
  templateUrl: './main-frame.component.html',
  styleUrls: ['./main-frame.component.css'],
  animations: [
    expand
  ]
})
export class MainFrameComponent implements OnInit, AfterViewInit {

  @ViewChild('filterFormDom') form: NgForm;
  @ViewChild( MatPaginator ) paginator: MatPaginator;

  
  @Input() data = {}
  @Output() reload = new EventEmitter


  loading = {}
  comment = ''

  // HISTORY
  history = new MatTableDataSource([])
  displayColumns = [
    'Fecha',
    'msg'
  ]

  showMore = false

  hideInsXld = true
  actionsBar = false

  actionMenu: MenuItem[]

  constructor( 
    public domSanitizer: DomSanitizer,
    public _init: InitService,
    public _api: ApiService,
    private _avalon: AvalonService,
    private orderPipe: OrderPipe,
    public _h: HelpersService,
    private _zh: ZonaHorariaService,
    public dialog: MatDialog ) { }

  ngOnInit(): void {
    this.getHistory( this.data['mlTicket'] )
    this.getRsvHistory( this.data['master']['zdUserId'] )

    this.actionMenu = [
      {label: 'New', icon: 'pi pi-fw pi-plus'},
      {label: 'Open', icon: 'pi pi-fw pi-download'},
      {label: 'Undo', icon: 'pi pi-fw pi-refresh'}
    ];

  }

  ngAfterViewInit(): void {
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.history.filter = filterValue.trim().toLowerCase();

    if (this.history.paginator) {
      this.history.paginator.firstPage();
    }
  }


  // **************************** APIS INICIO ****************************

    getHistory( tkt = this.data['mlTicket'] ){

      this.showMore = false

      this.loading['history'] = true

      this._api.restfulGet( tkt, 'Rsv/getHistory' )
                  .subscribe( res => {

                    this.loading['history'] = false;

                    this.history = new MatTableDataSource(this.orderPipe.transform(res['data'], 'Fecha', true))
                    this.history.paginator = this.paginator;

                  }, err => {
                    this.loading['history'] = false;

                    const error = err.error;
                    this._init.snackbar('error',err.statusText, error.msg);
                    console.error(err.statusText, error.msg);

                  });
    }

    sendComment(){
      this.loading['comment'] = true

      this._api.restfulPut( {ticket: this.data['mlTicket'], comment: this.comment}, 'Rsv/sendComment' )
                  .subscribe( res => {

                    this.loading['comment'] = false;
                    this.comment = ''
                    this.getHistory( this.data['mlTicket'] )

                  }, err => {
                    this.loading['comment'] = false;

                    const error = err.error;
                    this._init.snackbar('error',err.statusText, error.msg);
                    console.error(err.statusText, error.msg);

                  });
    }

    updateRelatedTicket(){
      this.loading['rlTicket'] = true

      this._api.restfulPut( {loc: this.data['master']['masterlocatorid'] }, 'Calls/getZdItemRelated' )
                  .subscribe( res => {

                    this.loading['rlTicket'] = false;
                    this._init.snackbar( 'success', 'Actualizado', res['msg'] );
                    this.reload.emit( this.data['master']['masterlocatorid'] )

                  }, err => {
                    this.loading['rlTicket'] = false;

                    const error = err.error;
                    this._init.snackbar( 'error', error.msg, err.status );
                    console.error(err.statusText, error.msg);

                  });
    }

    sendMailConfirm(){
      this.loading['sendConf'] = true

      this._api.restfulPut( {loc: this.data['master']['masterlocatorid']}, 'Rsv/sendFullConf' )
                  .subscribe( res => {

                    this.loading['sendConf'] = false;
                    this._init.snackbar('success','Enviado!', res['msg'])
                    this.getHistory()

                  }, err => {
                    this.loading['sendConf'] = false;

                    const error = err.error;
                    this._init.snackbar('error', error.msg, err.status );
                    console.error(err.statusText, error.msg);

                  });
    }

    getRsvHistory( zdClientId = this.data['master']['zdUserId'] ){

      this.loading['rsvHistory'] = true
      this.data['rsvHistory'] = []

      this._api.restfulGet( zdClientId, 'Rsv/getRsvHistory' )
                  .subscribe( res => {

                    this.loading['rsvHistory'] = false;
                    let rh = []

                    this.data['rsvHistory'] = res['data']

                  }, err => {
                    this.loading['rsvHistory'] = false;

                    const error = err.error;
                    this._init.snackbar( 'error', error.msg, err.status );
                    console.error(err.statusText, error.msg);

                  });
    }

    addBlacklist(){
      this.loading['loc'] = true

      this._api.restfulPut( {ml: this.data['master']['masterlocatorid'], zdId: this.data['master']['zdUserId']}, 'Rsv/addBlacklist' )
                  .subscribe( res => {

                    this.reload.emit( this.data['master']['masterlocatorid'] )
                  }, err => {
                    this.loading['loc'] = false;

                    const error = err.error;
                    this._init.snackbar( 'error', error.msg, err.status );
                    console.error(err.statusText, error.msg);

                  });
    }

    removeBlacklist(){
      this.loading['loc'] = true

      this._api.restfulPut( {ml: this.data['master']['masterlocatorid'], zdId: this.data['master']['zdUserId']}, 'Rsv/resetBlacklist' )
                  .subscribe( res => {

                    this.reload.emit( this.data['master']['masterlocatorid'] )
                  }, err => {
                    this.loading['loc'] = false;

                    const error = err.error;
                    this._init.snackbar( 'error', error.msg, err.status );
                    console.error(err.statusText, error.msg);

                  });
    }

    addCourtesyTransfer( flag = true ){
      this.loading['cTransfer'] = true

      this._api.restfulPut( {loc: this.data['master']['masterlocatorid'], flag}, 'Rsv/hasTransfer' )
                  .subscribe( res => {

                    this.loading['cTransfer'] = false;
                    this._init.snackbar( 'success', 'Traslado', res['msg'] );
                    this.data['master']['hasTransfer'] = flag
                    this.getHistory()

                  }, err => {
                    this.loading['cTransfer'] = false;

                    const error = err.error;
                    this._init.snackbar( 'error', error.msg, err.status );
                    console.error(err.statusText, error.msg);

                  });
    }

    avalonRegister( ml ){

      Swal.fire({
        title: 'Generando XML...',
        allowOutsideClick: false,
        })
      Swal.showLoading()

      this._api.xmlGet( ml + '/xml', 'Avalon/getRsvArr' )
                  .subscribe( res => {

                      this.postToAvalon( res )

                  }, err => {

                    Swal.close()
                    const error = err.error;
                    this._init.snackbar( 'error', error.msg, err.status );
                    console.error(err.statusText, error.msg);

                  });
    }

    postToAvalon( xml ){
      Swal.fire({
        title: 'Enviando XML a Avalon...',
        allowOutsideClick: false,
        })
      Swal.showLoading()
      this._avalon.xmlPost( xml, 'postReservation' )
              .subscribe( res => {

                
                this.uploadAvalonConfirmations( res )

              }, err => {

                Swal.close()
                const error = err.error;
                this._init.snackbar( 'error', 'No se pudo conectar con Avalon', err.status );
                console.error(err.statusText);

              });
    }

    uploadAvalonConfirmations( conf ){

      Swal.fire({
        title: 'Guardando confirmaciones de Avalon en CYC...',
        allowOutsideClick: false,
        })
      Swal.showLoading()

      this._api.restfulPut( conf, 'Rsv/saveAvalonConfirmation' )
                  .subscribe( res => {

                    Swal.close()
                    this._init.snackbar('success', 'Confirmados', res['msg'] );
                    this.reload.emit( this.data['master']['masterlocatorid'] )

                  }, err => {

                    Swal.close()
                    const error = err.error;
                    this._init.snackbar( 'error', error.msg, err.status );
                    console.error(err.statusText, error.msg);

                  });
    }
    
  // **************************** APIS FIN ****************************



  // **************************** VALIDADORES INICIO ****************************

  // **************************** VALIDADORES FIN ****************************



  // **************************** FORMATOS INICIO ****************************

    formatHistory( t ){
      let r = t

      r = r.replace(/[\n]/gm,'<br>')

      return r
    }

  // **************************** FORMATOS FIN ****************************
  

  // **************************** DIALOGS INICIO ****************************

    saldarDialog( d:any = null ): void {
      const dialogRef = this.dialog.open(SaldarDialog, {
        data: d,
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        if( result === true ){
          this.reload.emit( this.data['master']['masterlocatorid'] )
        }

        if( result === false ){
          Swal.fire('No hay items para saldar', '', 'info')
        }
      });
    }

    chCreatorDialog( d:any = null ): void {
      const dialogRef = this.dialog.open(ChangeCreatorDialog, {
        data: d,
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        if( result ){
          this.getHistory( this.data['mlTicket'] )
        }
      });
    }
    
    paymentRegDialog( d:any = null ): void {
      const dialogRef = this.dialog.open(PaymentRegDialog, {
        data: d,
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        if( result === true ){
          this.reload.emit( this.data['master']['masterlocatorid'] )
        }
      });
    }
    
    editPaymentDialog( d:any = null ): void {
      const dialogRef = this.dialog.open(EditPaymentDialog, {
        data: d,
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {

        if( result === true ){
          this.reload.emit( this.data['master']['masterlocatorid'] )
        }

      });
    }

    reactivateDialog( d:any = null ): void {
      const dialogRef = this.dialog.open(ReactivateDialog, {
        data: d,
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        if( result === true ){
          this.reload.emit( this.data['master']['masterlocatorid'] )
        }

        if( result == 'false-reload' ){
          Swal.fire('No hay items para reactivar', '', 'info')
          this.reload.emit( this.data['master']['masterlocatorid'] )
        }

        if( result === false ){
          Swal.fire('No hay items para reactivar', '', 'info')
        }
      });
    }

    modifyHotelDialog( d:any = null ): void {
      const dialogRef = this.dialog.open(ModifyHotelDialog, {
        data: d,
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        if( result == true ){
          this.reload.emit( this.data['master']['masterlocatorid'] )
        }
      });
    }

  // **************************** DIALOGS FIN ****************************
}

