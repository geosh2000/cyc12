import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guard/auth.guard';
import { CallStatisticsComponent } from './call-statistics/call-statistics.component';
import { QueueMonitorComponent } from './queue-monitor/queue-monitor.component';


const childRoutes: Routes = [
  { 
    path: 'queues', 
    component: QueueMonitorComponent ,
    canActivate: [ AuthGuard ],
    data: { title: 'Queue Monitor', role: 'monitor_gtr' } 
  },
  { 
    path: 'calls', 
    component: CallStatisticsComponent ,
    canActivate: [ AuthGuard ],
    data: { title: 'Call Statistics', role: 'monitor_gtr' } 
  },
]



@NgModule({
  imports: [RouterModule.forChild(childRoutes)],
  exports: [RouterModule]
})
export class ChildRoutesModule { }
