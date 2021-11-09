import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponentPM } from './home/home.component';
import { PmStartComponent } from './pm-start/pm-start.component';

const childRoutes: Routes = [
  
  { path: 'home', component: HomeComponentPM },
  { path: 'home/:token', component: HomeComponentPM },
  
]



@NgModule({
  imports: [RouterModule.forChild(childRoutes)],
  exports: [RouterModule]
})
export class ChildRoutesModule { }
