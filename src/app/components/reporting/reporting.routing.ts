import { RouterModule, Routes } from '@angular/router';
import { NgModule } from "@angular/core";

import { AuthGuard } from 'src/app/guard/auth.guard';
import { MainViewComponent } from '../main-view/main-view.component';





const reportingRoutes: Routes = [
    { 
        path: 'reportes', 
        component: MainViewComponent,
        canActivate: [ AuthGuard ],
        loadChildren: () => import('./child-routes.module').then( m => m.ChildRoutesModule )
    },
];

@NgModule({
  imports: [RouterModule.forChild( reportingRoutes )],
  exports: [RouterModule]
})
export class ReportingRoutingModule { }

