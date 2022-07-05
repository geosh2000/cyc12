import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';

import { CapitalizadoPipe } from '../pipes/capitalizado.pipe';
import { KeysPipe } from '../pipes/keys.pipe';
import { LowercasePipe } from '../pipes/lowercase.pipe';
import { DomSeguroPipe } from '../pipes/dom-seguro.pipe';

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
import { FlightSearchComponent } from './flight-search/flight-search.component';
import { AccountConfigComponent } from './account-config/account-config.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { SnackBarComponent } from './snack-bar/snack-bar.component';
import { SnackBarTemplateComponent } from './snack-bar-template/snack-bar-template.component';


@NgModule({
  declarations: [

    CapitalizadoPipe,
    LowercasePipe,
    KeysPipe,

    FlightSearchComponent,
    AccountConfigComponent,
    SnackBarComponent,
    SnackBarTemplateComponent,

  ],
  exports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
        
    CapitalizadoPipe,
    LowercasePipe,
    KeysPipe,

    FlightSearchComponent,
    AccountConfigComponent,
    SnackBarComponent,
    SnackBarTemplateComponent,

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
    MatAutocompleteModule,
    MatSidenavModule,
    MatListModule
  ]
})
export class SharedModule { }
