import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CotizadorComponent } from './cotizador/cotizador.component';
import { HomeGruposComponent } from './home/home.component';
import { ListadoComponent } from './listado/listado.component';


const childRoutes: Routes = [
    { 
      path: '', 
      children: [
          { path: '', component: ListadoComponent , data: { title: 'Oasis Comercial - Listado' }},
          { path: 'home', component: HomeGruposComponent , data: { title: 'Oasis Comercial - Home' }},
          { path: 'cotizar', component: CotizadorComponent , data: { title: 'Oasis Comercial - Cotizador' }},
          { path: 'cotizar/:opData', component: CotizadorComponent , data: { title: 'Oasis Comercial - Cotizador' }},
          // { path: 'cotizador', component: CotizadorComercialComponent , data: { title: 'Comercial - Cotizador' }}
      ]
  },
]



@NgModule({
  imports: [RouterModule.forChild(childRoutes)],
  exports: [RouterModule]
})
export class ChildRoutesModule { }
