import { Component, OnInit } from '@angular/core';
import { ApiService, InitService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-upload-complementos',
  templateUrl: './upload-complementos.component.html',
  styleUrls: ['./upload-complementos.component.css']
})
export class UploadComplementosComponent implements OnInit {

  data = []

  allRegs = 0
  maxRegs = 3000
  progress = []
  uploadArr = []

  loading = {}

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
      let cielo = [[]]
      let index = 0
      let i = 0

      for( let r of json ){

        // SPLIT BATCH TO UPLOAD
        if( i == this.maxRegs ){
          cielo.push([])
          index++
          i = 0
        }

        let row = {
          rsva      : r["RESERVA"],
          voucher   : r["VOUCHER"],
          complemento  : r["COMPLEMENTO"],
          comprobante  : r["COMPROBANTE"],
          moneda    : r["MON"],
          monto     : r["IMPORTE"],
          capturo   : r["CAP U"],
          updated   : 1,
          dtCaptura : this.excelDate(r["CAP F"])        }

        if( row['dtCaptura'] == 'Fecha inválida' ){
          row['dtCaptura'] = moment(r["CAP F"], 'DD/MM/YY').format('YYYY-MM-DD')
        }
        

        if( r['CAN U'].trim() == '' ){
          cielo[index].push( row )
          i++
          this.allRegs++
        }
        
      }

     this.data = cielo
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

    this._api.restfulPut( d[i], 'Uploads/saveComplementos')
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
