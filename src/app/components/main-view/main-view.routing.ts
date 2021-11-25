import { RouterModule, Routes } from '@angular/router';
import { NgModule } from "@angular/core";

import { AuthGuard } from 'src/app/guard/auth.guard';

import { MainViewComponent } from './main-view.component';
import { BlankComponent } from './blank/blank.component';
import { CotizadorRoutingModule } from '../cotizador/cotizador.routing';
import { PagosRoutingModule } from '../pagos/pagos.routing';
import { ConfigRoutingModule } from '../config/config.routing';
import { RsvRoutingModule } from '../rsv/rsv.routing';



const routes: Routes = [
    { 
        path: '', 
        component: MainViewComponent,
        canActivate: [ AuthGuard ],
        children: [
            { path: 'blank', component: BlankComponent , data: { title: 'Inicio' }},
            { path: '', redirectTo: '/blank', pathMatch: 'full' },
        ]
    },
];

@NgModule({
  imports: [
      RouterModule.forChild( routes ),
      CotizadorRoutingModule,
      PagosRoutingModule,
      ConfigRoutingModule,
      RsvRoutingModule,
    ],
  exports: [RouterModule]
})
export class MainRoutingModule { }

