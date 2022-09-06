import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guard/auth.guard';
import { ExportarAvalonComponent } from './exportar-avalon/exportar-avalon.component';
import { ReportingComponent } from './reporting.component';

const childRoutes: Routes = [
  { 
    path: 'confPendientes', 
    component: ReportingComponent ,
    canActivate: [ AuthGuard ],
    data: { title: 'Confirmaciones Pendientes de Captura', role: 'rsv_reset_confirm', reporte: 'confPendientes' } 
  },
  { 
    path: 'segurosPendientes', 
    component: ReportingComponent ,
    canActivate: [ AuthGuard ],
    data: { title: 'Seguros Pendientes de Captura', role: 'rsv_reset_confirm', reporte: 'segurosPendientes' } 
  },
  { 
    path: 'exportAvalon', 
    component: ExportarAvalonComponent ,
    canActivate: [ AuthGuard ],
    data: { title: 'Reservas para exportar a Avalon', role: 'rsv_reset_confirm', reporte: 'avalonPendientes' } 
  },
]



@NgModule({
  imports: [RouterModule.forChild(childRoutes)],
  exports: [RouterModule]
})
export class ChildRoutesModule { }
