import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotAllowedComponent } from './not-allowed/not-allowed.component';
import { NotFoundComponent } from './not-found/not-found.component';



@NgModule({
  declarations: [
    NotFoundComponent,
    NotAllowedComponent
  ],
  imports: [
    CommonModule
  ]
})
export class PagesModule { }
