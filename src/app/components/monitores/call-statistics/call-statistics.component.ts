import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService, InitService } from 'src/app/services/service.index';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

import * as moment from 'moment-timezone';
import 'moment/locale/es-mx';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD-MM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-call-statistics',
  templateUrl: './call-statistics.component.html',
  styleUrls: ['./call-statistics.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class CallStatisticsComponent implements OnInit, OnDestroy {

  options: any;
  loading = {}

  timeout: any;

  filterSearch =  new FormGroup({
    ['inicio']:        new FormControl({ value: '',  disabled: false }, [ Validators.required ]),
    ['fin']:        new FormControl({ value: '',  disabled: false }, [ Validators.required ]),
  })

  constructor( private _api: ApiService, private _init: InitService ) {
    moment.locale('es-mx');

  }

  ngOnInit(): void {
    clearTimeout(this.timeout)
    this.getCalls()
  }

  ngOnDestroy(): void {
      clearTimeout(this.timeout)
  }

  getCalls( i = moment(), f = moment() ){

    this.loading['chart'] = true

    let params = {
      inicio:   i.format('YYYY-MM-DD'),
      fin:      f.format('YYYY-MM-DD'),
      groupBy:  'hora',
      skill:    1
    }

    this._api.restfulPut( params, `Queuemetrics/callStats` )
                .subscribe( res => {

                  this.buildData( res['data'] )

                  this.timeout = setTimeout(() => {
                    this.getCalls()
                  }, 300000)

                }, err => {

                  this.loading['chart'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                  this.timeout = setTimeout(() => {
                    this.getCalls()
                  }, 120000)
                });
  }

  buildData ( d ){

    const xAxisData = [];
    const tdAns = [];
    const tdAbn = [];
    const lwCalls = [];
    const lyCalls = [];

    let index = {
      tda: 0,
      tdx: 0,
      ly: 0,
      lw: 0,
    }

    for (let i = 0; i < 50; i++) {

      let xTime = moment( moment().format('YYYY-MM-DD') + ' 00:00:00').add((i * 30), 'minutes').format('HH:mm')
      xAxisData.push( xTime );

      let tdaf =  d['td'][index['tda']] ? ( moment.tz( d['td'][index['tda']]['H'], 'America/Mexico_City' ).tz('America/Bogota').format('HH:mm') == xTime ) : false
      let tdxf =  d['td'][index['tdx']] ? ( moment.tz( d['td'][index['tdx']]['H'], 'America/Mexico_City' ).tz('America/Bogota').format('HH:mm') == xTime ) : false
      let lyf =   d['ly'][index['ly']] ? ( moment.tz( d['ly'][index['ly']]['H'], 'America/Mexico_City' ).tz('America/Bogota').format('HH:mm') == xTime ) : false
      let lwf =   d['lw'][index['lw']] ? ( moment.tz( d['lw'][index['lw']]['H'], 'America/Mexico_City' ).tz('America/Bogota').format('HH:mm') == xTime ) : false

      tdAns.push(   tdaf && d['td'][index['tda']] ? parseInt(d['td'][index['tda']]['Answered']) : 0 );
      tdAbn.push(   tdxf && d['td'][index['tdx']] ? parseInt(d['td'][index['tdx']]['Abandoned']) : 0 );
      lwCalls.push(   lyf && d['lw'][index['lw']] ? ( parseInt(d['lw'][index['lw']]['Offered']) ) : 0 );
      lyCalls.push(   lwf && d['ly'][index['ly']] ? ( parseInt(d['ly'][index['ly']]['Offered']) ) : 0 );

      index['tda']   += tdaf ? 1 : 0
      index['tdx']   += tdxf ? 1 : 0
      index['ly']  += lyf ? 1 : 0
      index['lw']  += lwf ? 1 : 0
    }

    this.options = {
      legend: {
        data: ['Answered', 'Abandoned', 'Last Week', 'Last Year'],
        align: 'right',
      },
      tooltip: {},
      xAxis: {
        data: xAxisData,
        silent: false,
        splitLine: {
          show: false,
        },
      },
      yAxis: {},
      series: [
        {
          colorBy: 'series',
          name: 'Last Week',
          type: 'line',
          data: lwCalls,
          animationDelay: (idx) => idx * 10 + 150,
        },
        {
          colorBy: 'series',
          name: 'Answered',
          type: 'bar',
          data: tdAns,
          stack: 'td',
          animationDelay: (idx) => idx * 10,
        },
        {
          colorBy: 'series',
          name: 'Last Year',
          type: 'line',
          data: lyCalls,
          animationDelay: (idx) => idx * 10 + 250,
        },{
          colorBy: 'series',
          name: 'Abandoned',
          type: 'bar',
          data: tdAbn,
          stack: 'td',
          animationDelay: (idx) => idx * 10 + 100,
        }
      ],
      animationEasing: 'elasticOut',
      animationDelayUpdate: (idx) => idx * 5,
    };

    this.loading['chart'] = false;

  }

}
