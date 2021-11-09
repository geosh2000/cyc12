import { RouterModule, Routes } from '@angular/router';
import { NgModule } from "@angular/core";
import { PublicManageComponent } from './public-manage.component';

const publicManageRoutes: Routes = [
    { 
        path: 'myReservation', 
        component: PublicManageComponent,
        loadChildren: () => import('./child-routes.module').then( m => m.ChildRoutesModule )
    },
];

@NgModule({
  imports: [RouterModule.forChild( publicManageRoutes )],
  exports: [RouterModule]
})
export class PublicManageRoutingModule { }

