import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guard/auth.guard';

import { LinkGeneratorComponent } from './link-generator/link-generator.component';
import { LinkReportComponent } from './link-report/link-report.component';

const childRoutes: Routes = [
  { 
    path: 'linkGenerator', 
    component: LinkGeneratorComponent , 
    canActivate: [ AuthGuard ],
    data: { title: 'Generacion de Links de Pago', role: 'payment_linkGenerator' } 
  },
  { 
    path: 'linkReport', 
    component: LinkReportComponent, 
    canActivate: [ AuthGuard ],
    data: { title: 'Reporte de Links de Pago', role: 'payment_linkGenerator' }
  },
]



@NgModule({
  imports: [RouterModule.forChild(childRoutes)],
  exports: [RouterModule]
})
export class ChildRoutesModule { }
