import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { OrderModule } from 'ngx-order-pipe';
import { SharedModule } from 'src/app/shared/shared.module';
import { QueueMonitorComponent } from './queue-monitor/queue-monitor.component';


@NgModule({
  declarations: [
    QueueMonitorComponent,
  ],
  exports: [
    QueueMonitorComponent,
  ],
  imports: [
    OrderModule,
    SharedModule,

    MatCardModule,
    MatIconModule,
  ]
})
export class MonitoresModule { }
