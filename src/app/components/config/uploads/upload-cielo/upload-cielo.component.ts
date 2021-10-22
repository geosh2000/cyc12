import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { ApiService, InitService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-upload-cielo',
  templateUrl: './upload-cielo.component.html',
  styleUrls: ['./upload-cielo.component.css']
})
export class UploadCieloComponent implements OnInit {

  complejo:Object = {
    OLITE: 'CANCUN',
    GOC: 'CANCUN',
    PYR: 'CANCUN',
    OHOC: 'CANCUN',
    OT: 'TULUM',
    SENS: 'SENS',
    SKGS: 'SENS',
    GOT: 'TULUM',
    OPB: 'PALM',
    GSC: 'PALM',
    GOP: 'PALM',
    SMART: 'SMART',
    OH: 'SMART',
    GOTSK: 'TULUM'
  }

  summary = {}
  cieloList:any = []

  allRegs = 0
  maxRegs = 3000
  progress = []
  uploadArr = []

  loading = {}

  constructor(
    private _api:ApiService,
    private _init:InitService
    ) { 

  }

  ngOnInit(): void {
  }

  buildSum(){
    let sum = {}

    for( let c in this.complejo ){
      sum[c] = { c:0,n:0,R:0,B:0,S:0,O:0 }
    }

    sum['total'] = { c:0,n:0,R:0,B:0,S:0,O:0 }

    return sum
  }

  buildVouchers( json ){

    this.progress = []

    return new Promise(async resolve => {

      this.summary = this.buildSum()
      this.allRegs = 0
      this.cieloList = []

      let cielo = [[]]
      let index = 0
      let i = 0

      for( let r of json ){

        if( r['SIGLA'] == 'SIGLA' ){
          continue
        }

        if( i == this.maxRegs ){
          cielo.push([])
          index++
          i = 0
        }

        let llegada   = typeof r['LLEGADA']   != 'number' ? String(r['LLEGADA']).split('/')   : []
        let salida    = typeof r['SALIDA']    != 'number' ? String(r['SALIDA']).split('/')    : []
        let dtCreated = typeof r['FECHACAP']  != 'number' ? String(r['FECHACAP']).split('/')  : []
        let dtCancel  = []

        if( r['S'] == 'C' ){
          dtCancel = typeof r['FCANCELA'] != 'number' ? r['FCANCELA'].split('/') : []
        }

        let rsv = {
          rsva:             r['RESERVA'],
          hotel:            r['SIGLA'],
          complejo:         this.complejo[r['SIGLA']],
          mdo:              r['MAYORIST'],
          agencia:          r['AGENCIA'],
          grupo:            r['GRUPO'],
          e:                r['S'] != 'C' ? r['S'] : (r['UCANCELA'] == 'NOSHOWS' ? 'n' : 'c'),
          nombre:           `${r['APELLIDO1']} ${r['NOMBRE1']}`,
          adultos:          r['ADULTOS'],
          juniors:          r['JUNIOR'],
          menores:          r['MENORES'],
          llegada:          typeof(r['LLEGADA']) == 'number' ? this.excelDate(r['LLEGADA']) : moment(`20${llegada[2]}-${parseInt(llegada[1])}-${llegada[0]}`).format('YYYY-MM-DD'),
          salida:           typeof(r['SALIDA']) == 'number' ? this.excelDate(r['SALIDA']) : moment(`20${salida[2]}-${parseInt(salida[1])}-${salida[0]}`).format('YYYY-MM-DD'),
          dtCreated:        typeof(r['FECHACAP']) == 'number' ? this.excelDate(r['FECHACAP']) : moment(`20${dtCreated[2]}-${parseInt(dtCreated[1])}-${dtCreated[0]}`).format('YYYY-MM-DD'),
          dtCancel:         r['S'] == 'C' ? (typeof(r['FCANCELA']) == 'number' ? this.excelDate(r['FCANCELA']) : moment(`20${dtCancel[2]}-${parseInt(dtCancel[1])}-${dtCancel[0]}`).format('YYYY-MM-DD')) : null,
          noches:           r['NOCHES'],
          notas:            this.validateText(r['NOTAS'], false, null),
          voucher:          this.validateText(r['VOUCHER'], false, null),
          total:            r['IMPORTE'],
          mon:              r['MON'],
          tipocambio:       this.validateText(r['TIPOCAMBIO'], false, null),
          hab:              this.validateText(r['HABI'], false, null),
          userCreated:      r['USUARIOCAP'],
          rp_char01:        r['TARIF'],
          pais:             r['PAI'],
          origen:           r['ORIGE'],
          userCancel:       r['UCANCELA'],
          userComision:     r['UVENDIO'],
          guest1_apellido:  this.validateText(r['APELLIDO1'], false, null),
          guest1_nombre:    this.validateText(r['NOMBRE1'], false, null),
          guest2_apellido:  this.validateText(r['APELLIDO2'], false, null),
          guest2_nombre:    this.validateText(r['NOMBRE2'], false, null),
          guest3_apellido:  this.validateText(r['APELLIDO3'], false, null),
          guest3_nombre:    this.validateText(r['NOMBRE3'], false, null),
          guest4_apellido:  this.validateText(r['APELLIDO4'], false, null),
          guest4_nombre:    this.validateText(r['NOMBRE4'], false, null),
          bedType:          this.validateText(r['C'], false, null),
          cieloMail:        this.validateText(r['EMAIL'], true, null),
          rp_char02:        r['RT_EVENTO'] ? r['RT_EVENTO'] : '',
          cieloOrId:        r['RT_ID'] ? r['RT_ID'] : '',
          cieloOrLevel:     r['RT_ORW'] ? r['RT_ORW'] : ''
        }
        cielo[index].push(rsv)
        i++

        this.summary[r['SIGLA']][rsv['e']]++
        this.summary['total'][rsv['e']]++
        this.allRegs++
      }

      this.cieloList = cielo
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
    let arr = this.cieloList

    for( let d of arr ){
      this.progress.push({s:0,l:0})
    }

    this.uploadArr = arr
    this.uploadApi(arr, 0)

  }

  uploadApi( d, i ){
    this.loading['uploading'] = true
    this.progress[i]['s'] = 1

    this._api.restfulPut( d[i], 'Uploads/saveCielo')
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
