import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComercialComponent } from './comercial.component';
import { CotizadorComercialComponent } from './cotizador-comercial/cotizador-comercial.component';
import { HomeComponent } from './home/home.component';


const childRoutes: Routes = [
    { 
      path: '', 
      children: [
          { path: '', component: HomeComponent , data: { title: 'Oasis - Comercial' }},
          { path: 'home', component: HomeComponent , data: { title: 'Oasis - Comercial' }},
          { path: 'cotizador', component: CotizadorComercialComponent , data: { title: 'Comercial - Cotizador' }}
      ]
  },
]



@NgModule({
  imports: [RouterModule.forChild(childRoutes)],
  exports: [RouterModule]
})
export class ChildRoutesModule { }
