import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';

import { CapitalizadoPipe } from '../pipes/capitalizado.pipe';
import { KeysPipe } from '../pipes/keys.pipe';
import { LowercasePipe } from '../pipes/lowercase.pipe';

import { SnackBarTemplateComponent } from './snack-bar-template/snack-bar-template.component';
import { SnackBarComponent } from './snack-bar/snack-bar.component';
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


@NgModule({
  declarations: [
    SnackBarComponent,
    SnackBarTemplateComponent,
    CapitalizadoPipe,
    LowercasePipe,
    KeysPipe,
    ZdUserSearchComponent,
    LocSearchComponent,
    ZdUserEditComponent,
  ],
  exports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    
    CapitalizadoPipe,
    LowercasePipe,
    KeysPipe,

    SnackBarComponent,
    SnackBarTemplateComponent,
    ZdUserSearchComponent,
    LocSearchComponent,
    ZdUserEditComponent,
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,

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
export class SharedModule { }
