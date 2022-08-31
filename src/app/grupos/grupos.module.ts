import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { HomeGruposComponent } from './home/home.component';
import { GruposComponent } from './grupos.component';
import { ListadoComponent } from './listado/listado.component';
import { LoginComponent } from './login/login.component';
import { CotizadorComponent } from './cotizador/cotizador.component';
import { SendRoomComponent } from './cotizador/send-room/send-room.component';
import { OportunidadesSearchComponent } from './cotizador/oportunidades-search/oportunidades-search.component';
import { OportunidadesCreateDialog } from './cotizador/oportunidades-search/oportunidades-create/oportunidades-create.dialog';
import { DisplayOptionsComponent } from './cotizador/display-options/display-options.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { CartCheckoutDialog } from './cotizador/display-options/cart-checkout/cart-checkout.dialog';



@NgModule({
  declarations: [
    GruposComponent,
    LoginComponent,
    HomeGruposComponent,
    ListadoComponent,
    CotizadorComponent,

    SendRoomComponent,
    OportunidadesSearchComponent,
    OportunidadesCreateDialog,
    DisplayOptionsComponent,
    CartCheckoutDialog
  ],
  exports: [
    GruposComponent,
    LoginComponent,
    HomeGruposComponent,
    ListadoComponent,
    CotizadorComponent,

    SendRoomComponent,
    OportunidadesSearchComponent,
    OportunidadesCreateDialog,
    DisplayOptionsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,

    MatToolbarModule,
    MatSliderModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatGridListModule,
    MatCardModule,
    MatExpansionModule,
    MatDividerModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    MatMomentDateModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatChipsModule,
    MatRadioModule,
    MatDialogModule,
    MatMenuModule,
    MatStepperModule,
    MatTooltipModule,
    MatBadgeModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
  ]
})
export class GruposModule { }
