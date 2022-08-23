import { RouterModule, Routes } from '@angular/router';
import { NgModule } from "@angular/core";
import { GruposComponent } from './grupos.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from '../guard/auth.guard';


const comercialRoutes: Routes = [
  { 
      path: 'grupos', 
      component: GruposComponent,
      // canActivate: [ AuthGuard ],
      canLoad: [ AuthGuard ],
      loadChildren: () => import('./child-routes.module').then( m => m.ChildRoutesModule )
  },
  { 
      path: 'grupos/login', 
      component: LoginComponent
  },
];

@NgModule({
imports: [RouterModule.forChild( comercialRoutes )],
exports: [RouterModule]
})
export class GruposRoutingModule { }

