import { RouterModule, Routes } from '@angular/router';
import { NgModule } from "@angular/core";

import { AuthGuard } from 'src/app/guard/auth.guard';
import { MainViewComponent } from '../main-view/main-view.component';





const pagosRoutes: Routes = [
    { 
        path: 'pagos', 
        component: MainViewComponent,
        canActivate: [ AuthGuard ],
        canLoad: [ AuthGuard ],
        loadChildren: () => import('./child-routes.module').then( m => m.ChildRoutesModule )
    },
];

@NgModule({
  imports: [RouterModule.forChild( pagosRoutes )],
  exports: [RouterModule]
})
export class PagosRoutingModule { }

