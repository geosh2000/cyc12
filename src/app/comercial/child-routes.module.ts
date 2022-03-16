import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComercialComponent } from './comercial.component';
import { CotizadorComercialComponent } from './cotizador-comercial/cotizador-comercial.component';


const childRoutes: Routes = [
    { 
      path: '', 
      children: [
          { path: 'home', component: ComercialComponent , data: { title: 'Oasis - Comercial' }},
          { path: 'cotizador', component: CotizadorComercialComponent , data: { title: 'Comercial - Cotizador' }},
      ]
  },
]



@NgModule({
  imports: [RouterModule.forChild(childRoutes)],
  exports: [RouterModule]
})
export class ChildRoutesModule { }
