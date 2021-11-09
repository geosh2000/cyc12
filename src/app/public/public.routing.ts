import { RouterModule, Routes } from '@angular/router';
import { NgModule } from "@angular/core";
import { PublicManageRoutingModule } from './public-manage/public-manage.routing';


const routes: Routes = [
    { 
        path: '', 
        loadChildren: () => import('./child-routes.module')
            .then( m => m.ChildRoutesModule )
    },
];

@NgModule({
  imports: [
    RouterModule.forChild( routes ),
    PublicManageRoutingModule
  ],
  exports: [RouterModule]
})
export class PublicRoutingModule { }

