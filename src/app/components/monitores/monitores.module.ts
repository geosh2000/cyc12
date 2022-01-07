import { NgModule } from '@angular/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';

import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgxEchartsModule } from 'ngx-echarts';

import { OrderModule } from 'ngx-order-pipe';
import { SharedModule } from 'src/app/shared/shared.module';

import { CallStatisticsComponent } from './call-statistics/call-statistics.component';
import { QueueMonitorComponent } from './queue-monitor/queue-monitor.component';


@NgModule({
  declarations: [
    QueueMonitorComponent,
    CallStatisticsComponent,
  ],
  exports: [
    QueueMonitorComponent,
    CallStatisticsComponent,
  ],
  imports: [
    OrderModule,
    SharedModule,

    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),

    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatMomentDateModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class MonitoresModule { }
