import { Component, OnInit } from '@angular/core';
import { ApiService, InitService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-upload-desplazos',
  templateUrl: './upload-desplazos.component.html',
  styleUrls: ['./upload-desplazos.component.css']
})
export class UploadDesplazosComponent implements OnInit {

  data = []

  allRegs = 0
  maxRegs = 3000
  progress = []
  uploadArr = []

  loading = {}

  summary = {
    origen: {
      PYR: 0,
      GOC: 0,
      OHOC: 0,
      GOP: 0,
      OPB: 0,
      OH: 0,
      SMART: 0,
    },
    destino: {

    }
  }

  constructor(
    private _api:ApiService,
    private _init:InitService
  ) { }

  ngOnInit(): void {
  }

  buildVouchers( json ){

    return new Promise(async resolve => {
        
      this.progress = []
      this.loading['roiback'] = true

      this.allRegs = 0

      this.data = []

      let cielo = []
      let updates = []
      
      for( let r of json ){

        let row = {
          org_rsva    : r["RV_RESERVA"],
          org_hotel   : r["RV_HO"],
          org_mdo     : r["RV_MAYOR"],
          dst_rsva    : r["RV_RESERVA_D"],
          dst_hotel   : r["RV_HOTEL_DEST_DESC"],
          dst_isOasis : r["RV_HOTEL_DEST_DESC"] != null ? (r["RV_HOTEL_DEST_DESC"].substring(0,1) == '*' ? true : false) : false
        }

        let update = [
          {
            table: 't_reservations',
            flag: true,
            set: {
              isDesplazo_o: 1, 
              desp_rsvaDestino: row['dst_rsva']
            },
            where: {
              rsva: row['org_rsva'],
              hotel: row['org_hotel']
            }
          },
          {
            table: 't_reservations',
            flag: true,
            set: {
              isDesplazo_d: 1, 
              desp_rsvaOrigen: row['org_rsva']
            },
            where: {
              rsva: row['dst_rsva']
            }
          },
          {
            table: 'cycoasis_rsv.r_items',
            flag: row['org_mdo'].toLowerCase() == 'dir',
            set: {
              confirm: row['dst_rsva']
            },
            like: [ 'confirm', row['org_rsva'], 'before'  ]
          }
        ]

        if( update[2].flag && !row['dst_isOasis'] ){
          update[0].set['xldCobrable'] = 1
        }

        this.summary.origen[row['org_hotel']] ++
        
        if( this.summary.destino[ row['dst_hotel'] ] ){
          this.summary.destino[ row['dst_hotel'] ]++
        }else{
          this.summary.destino[ row['dst_hotel'] ] = 1
        }

        

        cielo.push( update )

      }

     this.data = [cielo]

     resolve( true )

    })
  }

  excelDate( excelDate ) {
    return moment(new Date((Math.round(excelDate) - (25567 + 1))*86400*1000).toLocaleDateString('en-US'), 'DD/MM/YYYY').format('YYYY-MM-DD');
  }

  validateText( t, trim, nt){
    return t ? (trim ? String(t).trim() : (t == ' ' ? null : t)) : nt
  }

  upload( ){
    this.progress = []
    let arr = this.data

    for( let d of arr ){
      this.progress.push({s:0,l:0})
    }

    this.uploadArr = arr
    this.uploadApi(arr, 0)

  }

  uploadApi( d, i ){
    this.loading['uploading'] = true
    this.progress[i]['s'] = 1

    this._api.restfulPut( d[i], 'Uploads/saveDesplazos')
            .subscribe( res => {

              this.loading['uploading'] = false

              this.progress[i]['s'] = 2
              this.progress[i]['l'] = res['data'].length
              this.progress[i]['r'] = res['result']
              i++
              if( i < d.length ){
                this.uploadApi( d, i )
              }
            },
            err => {
              this.loading['uploading'] = false
              const error = err.error;

              this._init.snackbar('error', error.msg, 'Cerrar')
              this.progress[i]['s'] = 3
              this.progress[i]['r'] = err

              for(let x = i;i<d.length;i++){
                this.progress[i]['s'] = 0
              }

              console.error(err.statusText, error.msg);
            });

  }

}
