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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrderModule } from 'ngx-order-pipe';
import { SharedModule } from 'src/app/shared/shared.module';
import { ItemSumComponent } from './components/item-sum/item-sum.component';
import { LocSumComponent } from './components/loc-sum/loc-sum.component';
import { MainFrameComponent } from './components/main-frame/main-frame.component';
import { GenerateAuthFileComponent } from './generate-auth-file/generate-auth-file.component';
import { ChangeCreatorDialog } from './modals/change-creator/change-creator-dialog';
import { EditZdDialog } from './modals/edit-zd-dialog/edit-zd-dialog';
import { PagosDialog } from './modals/pagos-modal/pagos-modal';
import { RsvComponent } from './rsv.component';



@NgModule({
  declarations: [
    RsvComponent,
    GenerateAuthFileComponent,

    MainFrameComponent,
    ItemSumComponent,
    LocSumComponent,

    PagosDialog,
    ChangeCreatorDialog,
    EditZdDialog,
  ],
  exports: [
    RsvComponent,
    GenerateAuthFileComponent,
    
    MainFrameComponent,
    ItemSumComponent,
    LocSumComponent,

    PagosDialog,
    ChangeCreatorDialog,
    EditZdDialog,
  ],
  imports: [
    OrderModule,
    SharedModule,

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
  ]
})
export class RsvModule { }
