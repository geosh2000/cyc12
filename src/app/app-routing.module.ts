import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CotizadorComponent } from './components/cotizador/cotizador.component'
import { MainViewComponent } from './components/main-view/main-view.component';
import { NotFoundComponent } from './components/not-found/not-found.component';


const routes: Routes = [

  { 
    path: '', 
    component: MainViewComponent ,
    children: [
      { path: 'cotizar', component: CotizadorComponent },
      { path: '', redirectTo: '/cotizar', pathMatch: 'full' },
    ]
  },

  { path: '**', component: NotFoundComponent },
  

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true, scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
