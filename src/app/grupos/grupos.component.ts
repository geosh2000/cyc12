import { Component, Inject, OnDestroy, OnInit, Testability } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ApiService, ComercialService, InitService, LoginService } from '../services/service.index';
import { AccountConfigComponent } from '../shared/account-config/account-config.component';

@Component({
  selector: 'app-grupos',
  templateUrl: './grupos.component.html',
  styleUrls: ['./grupos.component.css']
})
export class GruposComponent implements OnInit, OnDestroy {
  
  token = true
  tokenCheck$

  constructor( public _api: ApiService,
                public _init: InitService,
                public dialog: MatDialog, 
                private _route:Router,
                private _com: ComercialService,
                private _li: LoginService ) { }

  async ngOnInit(){

    await this._li.reloadTokenCheck( 'comercial-' )

    this.token = this._init.token.value

    this.tokenCheck$ = this._init.token.subscribe( t => {

      this.token = t

      if( !t ){
        if( this._api.app == 'comercial-'){
          // this.loginComercialDialog()
          this._route.navigateByUrl('/grupos/login')
        }
      }
    })
  }

  ngOnDestroy(): void {
    this.tokenCheck$.unsubscribe()
    this.dialog.closeAll()
  }

  logout(){
    console.log('logout')
    this._li.logout( 'comercial-' )
  }

  test(){
    console.log('logout')
  }

  loginComercialDialog(): void {
    
    if(this.dialog.openDialogs.length==0){
      // const dialogRef = this.dialog.open(ComercialLoginDialog, { disableClose: true });
      
      // dialogRef.afterClosed().subscribe(result => {
      //   console.log('The dialog was closed', result);
      // });
    }

  }

  configDialog( d:any = null ): void {
    const dialogRef = this.dialog.open(AccountConfigComponent, {
      // width: '250px',
      data: d,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed', result);
    });
  }


}
 