import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CotizadorComponent } from './components/cotizador/cotizador.component';
import { MainViewComponent } from './components/main-view/main-view.component';


const routes: Routes = [

  // { path: '', component: MainViewComponent }

  { path: 'cotizar', component: CotizadorComponent },

  

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true, scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
