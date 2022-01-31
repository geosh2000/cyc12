import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PaymentRegisterComponent } from 'src/app/components/shared/payment-register/payment-register.component';
import { ApiService, InitService } from 'src/app/services/service.index';


@Component({
  selector: 'payment-reg-dialog',
  templateUrl: './payment-reg-dialog.html',
  styleUrls: ['./payment-reg-dialog.css']
})
export class PaymentRegDialog implements OnInit, AfterViewInit {

    @ViewChild(PaymentRegisterComponent) _ins: PaymentRegisterComponent;

    loading = {}

    constructor(
      public paymentRegDialog: MatDialogRef<PaymentRegDialog>,
      public _api: ApiService,
      private _init: InitService,
      @Inject(MAT_DIALOG_DATA) public data) {

      }

    ngOnInit(): void {
    }
  
    ngAfterViewInit(): void {
    }
  
    onNoClick( f = false ): void {
      this.paymentRegDialog.close( f );
    }

  }