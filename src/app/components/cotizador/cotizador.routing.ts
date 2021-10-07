import { RouterModule, Routes } from '@angular/router';
import { NgModule } from "@angular/core";

import { AuthGuard } from 'src/app/guard/auth.guard';
import { MainViewComponent } from '../main-view/main-view.component';





const cotizadorRoutes: Routes = [
    { 
        path: 'cotizar', 
        component: MainViewComponent,
        canActivate: [ AuthGuard ],
        loadChildren: () => import('./child-routes.module').then( m => m.ChildRoutesModule )
    },
];

@NgModule({
  imports: [RouterModule.forChild( cotizadorRoutes )],
  exports: [RouterModule]
})
export class CotizadorRoutingModule { }

