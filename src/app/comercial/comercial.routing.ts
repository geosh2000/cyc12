import { RouterModule, Routes } from '@angular/router';
import { NgModule } from "@angular/core";
import { ComercialComponent } from './comercial.component';


const comercialRoutes: Routes = [
  { 
      path: 'comercial', 
      component: ComercialComponent,
      // canActivate: [ AuthGuard ],
      // canLoad: [ AuthGuard ],
      loadChildren: () => import('./child-routes.module').then( m => m.ChildRoutesModule )
  },
];

@NgModule({
imports: [RouterModule.forChild( comercialRoutes )],
exports: [RouterModule]
})
export class ComercialRoutingModule { }

