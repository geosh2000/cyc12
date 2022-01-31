import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService, InitService } from 'src/app/services/service.index';
import { InsuranceManageComponent } from '../../../shared/insurance-manage/insurance-manage.component';


@Component({
  selector: 'app-manage-ins',
  templateUrl: './manage-ins.dialog.html',
  styleUrls: ['./manage-ins.dialog.css']
})
export class ManageInsDialog implements OnInit, AfterViewInit {

    @ViewChild(InsuranceManageComponent) _ins: InsuranceManageComponent;

    loading = {}

    constructor(
      public insuranceDialog: MatDialogRef<ManageInsDialog>,
      private _api: ApiService,
      private _init: InitService,
      @Inject(MAT_DIALOG_DATA) public data) {

      }

    ngOnInit(): void {
      // this.init()
    }
  
    ngAfterViewInit(): void {
      this._ins.loadIns( this.data )
    }
  
    onNoClick( f = false ): void {
      this.insuranceDialog.close( f );
    }

  }