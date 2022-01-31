import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guard/auth.guard';
import { RsvComponent } from './rsv.component';

const childRoutes: Routes = [
  { 
    path: '', 
    component: RsvComponent ,
    canActivate: [ AuthGuard ],
    data: { title: 'Rsv Manager', role: 'app_cotizador_rsv' } 
  },
  
  { 
    path: ':loc', 
    component: RsvComponent ,
    canActivate: [ AuthGuard ],
    data: { title: 'Rsv Manager', role: 'app_cotizador_rsv' } 
  },
]



@NgModule({
  imports: [RouterModule.forChild(childRoutes)],
  exports: [RouterModule]
})
export class ChildRoutesModule { }
