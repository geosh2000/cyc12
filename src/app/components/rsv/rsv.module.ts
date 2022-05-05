import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

import { InputNumberModule } from 'primeng/inputnumber';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';

import { OrderModule } from 'ngx-order-pipe';
import { SharedModule } from 'src/app/shared/shared.module';
import { ComponentsSharedModule } from '../shared/components-shared.module';

import { ChangeCreatorDialog } from './modals/change-creator/change-creator-dialog';
import { EditPaymentDialog } from './modals/edit-payments-dialog/edit-payments-dialog';
import { EditZdDialog } from './modals/edit-zd-dialog/edit-zd-dialog';
import { ManageInsDialog } from './modals/manage-ins/manage-ins.dialog';
import { PagosDialog } from './modals/pagos-modal/pagos-modal';
import { PaymentRegDialog } from './modals/payment-reg-dialog/payment-reg-dialog';
import { ReactivateDialog } from './modals/reactivate-dialog/reactivate-dialog';
import { SaldarDialog } from './modals/saldar-dialog/saldar-dialog';
import { ModifyHotelDialog } from './modals/modify-hotel/modify-hotel.dialog';
import { ShowItemPaymentsDialog } from './modals/show-item-payments-dialog/show-item-payments-dialog';

import { RsvComponent } from './rsv.component';
import { ItemSumComponent } from './components/item-sum/item-sum.component';
import { LocSumComponent } from './components/loc-sum/loc-sum.component';
import { MainFrameComponent } from './components/main-frame/main-frame.component';
import { GenerateAuthFileComponent } from './generate-auth-file/generate-auth-file.component';
import { ItemBlockSumComponent } from './components/item-block-sum/item-block-sum.component';




@NgModule({
  declarations: [
    RsvComponent,
    GenerateAuthFileComponent,

    ItemBlockSumComponent,

    MainFrameComponent,
    ItemSumComponent,
    LocSumComponent,

    PagosDialog,
    ChangeCreatorDialog,
    EditZdDialog,
    ManageInsDialog,
    ReactivateDialog,
    PaymentRegDialog,
    EditPaymentDialog,
    SaldarDialog,
    ModifyHotelDialog,
    ShowItemPaymentsDialog,
  ],
  exports: [
    RsvComponent,
    GenerateAuthFileComponent,

    ItemBlockSumComponent,
    
    MainFrameComponent,
    ItemSumComponent,
    LocSumComponent,

    PagosDialog,
    ChangeCreatorDialog,
    EditZdDialog,
    ManageInsDialog,
    ReactivateDialog,
    PaymentRegDialog,
    EditPaymentDialog,
    SaldarDialog,
    ModifyHotelDialog,
    ShowItemPaymentsDialog,
  ],
  imports: [
    OrderModule,
    SharedModule,
    ComponentsSharedModule,
    
    MatProgressBarModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatRadioModule,
    MatStepperModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatMomentDateModule,

    InputNumberModule,
    MenuModule,
    ButtonModule,
  ]
})
export class RsvModule { }
