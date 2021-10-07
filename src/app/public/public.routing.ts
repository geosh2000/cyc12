import { RouterModule, Routes } from '@angular/router';
import { NgModule } from "@angular/core";


const routes: Routes = [
    { 
        path: '', 
        loadChildren: () => import('./child-routes.module')
            .then( m => m.ChildRoutesModule )
    },
];

@NgModule({
  imports: [RouterModule.forChild( routes )],
  exports: [RouterModule]
})
export class PublicRoutingModule { }

