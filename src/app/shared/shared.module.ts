import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';

import { CapitalizadoPipe } from '../pipes/capitalizado.pipe';
import { KeysPipe } from '../pipes/keys.pipe';
import { LowercasePipe } from '../pipes/lowercase.pipe';
import { LoginComponent } from './login/login.component';
import { SnackBarTemplateComponent } from './snack-bar-template/snack-bar-template.component';
import { SnackBarComponent } from './snack-bar/snack-bar.component';

import { MaterialModule } from './material.module';



@NgModule({
  declarations: [
    SnackBarComponent,
    SnackBarTemplateComponent,
    LoginComponent,
    CapitalizadoPipe,
    LowercasePipe,
    KeysPipe,
  ],
  exports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,

    SnackBarComponent,
    SnackBarTemplateComponent,
    LoginComponent,
    CapitalizadoPipe,
    LowercasePipe,
    KeysPipe,
    MaterialModule
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,

    MaterialModule
    
  ]
})
export class SharedModule { }
