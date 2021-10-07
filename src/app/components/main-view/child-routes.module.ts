import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guard/auth.guard';

import { MainViewComponent } from './main-view.component';
import { PagosComponent } from '../pagos/pagos.component';

const childRoutes: Routes = [
    { 
      path: '', 
      component: MainViewComponent,
      canLoad: [ AuthGuard ],
      children: [
          // { path: 'pagos', component: PagosComponent },
          // { path: '', redirectTo: '/pagos', pathMatch: 'full' },
      ]
  },
]



@NgModule({
  imports: [RouterModule.forChild(childRoutes)],
  exports: [RouterModule]
})
export class ChildRoutesModule { }
