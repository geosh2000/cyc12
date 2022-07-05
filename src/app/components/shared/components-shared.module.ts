import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { CommonModule } from '@angular/common';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';

import { CapitalizadoPipe } from 'src/app/pipes/capitalizado.pipe';
import { LowercasePipe } from 'src/app/pipes/lowercase.pipe';
import { KeysPipe } from 'src/app/pipes/keys.pipe';

import { ZdUserSearchComponent } from './zd-user-search/zd-user-search.component';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { LocSearchComponent } from './loc-search/loc-search.component';
import { ZdUserEditComponent } from './zd-user-edit/zd-user-edit.component';
import { MergeUsersComponent } from './merge-users/merge-users.component';
import { GoToLocComponent } from './go-to-loc/go-to-loc.component';
import { InsuranceManageComponent } from './insurance-manage/insurance-manage.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PaymentRegisterComponent } from './payment-register/payment-register.component';



@NgModule({
  declarations: [
    GoToLocComponent,
    ZdUserSearchComponent,
    LocSearchComponent,
    ZdUserEditComponent,
    MergeUsersComponent,
    InsuranceManageComponent,
    PaymentRegisterComponent,

  ],
  exports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,

    GoToLocComponent,
    ZdUserSearchComponent,
    LocSearchComponent,
    ZdUserEditComponent,
    MergeUsersComponent,
    InsuranceManageComponent,
    PaymentRegisterComponent,
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,

    MatSnackBarModule,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatStepperModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    MatRadioModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatAutocompleteModule
  ]
})
export class ComponentsSharedModule { }
