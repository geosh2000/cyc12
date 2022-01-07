import { Component, OnInit } from '@angular/core';
import { OrderPipe } from 'ngx-order-pipe';
import { ApiService, InitService } from 'src/app/services/service.index';

import * as moment from 'moment';

@Component({
  selector: 'app-queue-monitor',
  templateUrl: './queue-monitor.component.html',
  styleUrls: ['./queue-monitor.component.css']
})
export class QueueMonitorComponent implements OnInit {

  data = []
  wa = {}
  lu = 'waiting...'

  queue = {}

  loading = {}
  timeout:any
  
  constructor( private _api: ApiService, private _ord: OrderPipe, private _init: InitService ) { }

  ngOnInit(): void {
    this.getData()
    this.queueStatus()
  }

  getData() {

    this.loading['data'] = true;

    this._api.restfulGet( '', `Calls/talkAgentStatus` )
                .subscribe( res => {

                  this.loading['data'] = false;
                  let data = []

                  // tslint:disable-next-line: forin
                  for( let f of res['data']['data']['agents_activity']){
                    f['whatsapp'] = res['date']['wa'][f['agent_id']] ? res['date']['wa'][f['agent_id']] : {}
                    data.push(f)
                  }

                  data = this._ord.transform(data,'name')
                  this.data = data
                  
                  this.lu = moment(res['date']['lu']).format('DD/MMM HH:mm:ss')
                  this.timeout = setTimeout( () => this.getData(), 10000 )

                }, err => {

                  this.loading['data'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                  this.timeout = setTimeout( () => this.getData(), 2000 )

                });
  }

  queueStatus() {

    this.loading['queue'] = true;

    this._api.restfulGet( '', `Calls/talkStatus` )
                .subscribe( res => {

                  this.loading['queue'] = false;
                  let data = []

                  this.queue = res['data']['data']['current_queue_activity']

                  this.timeout = setTimeout( () => this.queueStatus(), 9000 )

                }, err => {

                  this.loading['queue'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                  this.timeout = setTimeout( () => this.queueStatus(), 2000 )

                });
  }

  timePrint( s ){
    let duration = moment.duration(s, 'seconds');
    
    return moment.utc(duration.as('milliseconds')).format('HH:mm:ss')
  }

  printVal( f, g ){

    if( typeof g === 'object' ){
      return JSON.stringify(g)
    }

    if( f.match(/time/g) || f.match(/duration/g) ){
      let r = moment.duration(g, 'seconds')
      let hours:any = Math.floor(r.asHours())
      let minutes:any = Math.floor(r.asMinutes()) - ( hours * 60 )
      let seconds:any = Math.floor(r.asSeconds()) - ( Math.floor(r.asMinutes()) * 60 )

      if( hours < 10 ){ hours = `0${ hours }` }
      if( minutes < 10 ){ minutes = `0${ minutes }` }
      if( seconds < 10 ){ seconds = `0${ seconds }` }

      return `${ hours }:${ minutes }:${ seconds }`

    }else{
      return g
    }
  }

  bgStatus( s ){

    let st = s['agent_state']

    switch( st ){
      case 'online':
      case 'transfers_only':
        switch(s['call_status']){
          case null:
            return st == 'online' ? 'status-avail' : 'status-transfer'
          case 'on_call':
            return 'status-call'
          case 'wrap_up':
            return 'status-wrap'
        }
        break
      case 'offline':
        return 'status-unavail'
      case 'away':
        return 'status-pause'
    }
  }

}
