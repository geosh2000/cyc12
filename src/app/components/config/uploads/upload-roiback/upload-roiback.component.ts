import { Component, OnInit } from '@angular/core';
import { ApiService, HelpersService, InitService } from 'src/app/services/service.index';
import { utils, read as readXlsx } from 'xlsx';

@Component({
  selector: 'app-upload-roiback',
  templateUrl: './upload-roiback.component.html',
  styleUrls: ['./upload-roiback.component.css']
})
export class UploadRoibackComponent implements OnInit {

  rb = {}
  progress  = []
  uploadArr = []
  loading   = {}
  summary   = {}
  allRegs   = 0

  constructor(
    public _h: HelpersService,
    private _api: ApiService,
    private _init: InitService
  ) { }

  ngOnInit(): void {
  }

  buildVouchers( wb ){

    return new Promise(async resolve => {

      let jsonFile = {
        'rsvas': utils.sheet_to_json( wb.Sheets['Reservas'], {raw: true, defval:null} ),
        'habs': utils.sheet_to_json( wb.Sheets['Habitación detalles'], {raw: true, defval:null} ),
        'traslados': utils.sheet_to_json( wb.Sheets['Complementos detalles'], {raw: true, defval:null} ),
        'tours': utils.sheet_to_json( wb.Sheets['Paquetes detalles'], {raw: true, defval:null} ),
      }

      console.log( jsonFile )

      let result = {
        'rsvas': [[]]
      }

      let index = 0
      let i = 0

      for( let tr of jsonFile['rsvas'] ){
  
        if( i == 500 ){
          result['rsvas'].push([])
          index++
          i = 0
        }

        let rs = {
          'rb_voucher'  : tr['Identificador de reserva'],
          'agencia'     : tr['Agencia'],
          'canal'       : tr['Canal'],
          'correo'      : tr['Correo electrónico'],
          'dtCreated'   : this._h.excelDate( tr['Alta'], true ),
          'st'          : tr['Estado'],
          'dtConfirmed' : this._h.excelDate( tr['Fecha confirmación'], true ),
          'dtCancel'    : this._h.excelDate( tr['Fecha de cancelación'], true ),
          'dtModified'  : this._h.excelDate( tr['Fecha modificación'], true ),
          'inicio'      :  this._h.excelDate( tr['Fecha entrada'] ),
          'fin'         :  this._h.excelDate( tr['Fecha salida'] ),
          'fdp'         : tr['Forma de pago'],
          'habs'        : tr['Habitaciones'],
          'hotel'       : tr['Hotel'],
          'idioma'      : tr['Idioma reserva'],
          'monto'       : tr['Importe facturado'],
          'mdo'         : tr['Mercado'],
          'moneda'      : tr['Moneda'],
          'motivoXld'   : tr['Motivo de la cancelación'],
          'rn'          : tr['Noches habitaciones'],
          'name'        : tr['Nombre'],
          'pax'         : tr['Ocupantes'],
          'paquetes'    : tr['Paquetes'],
          'pais'        : tr['País'],
          'tfa'         : tr['Tarifas'],
          'orid'        : tr['Número de socio'] ?? tr['Usuario registrado (id)'],
          'habitaciones': '[]',
          'tours'       : '[]',
          'traslados'   : '[]'
        }

        // HABS

        let habs = jsonFile['habs'].filter(e => e['Identificador de reserva'] === rs['rb_voucher'])

        if( habs.length > 0 ){
          
          for( let hb of habs ){
            hb['Fecha entrada'] = this._h.excelDate( hb['Fecha entrada'] )
            hb['Fecha salida'] = this._h.excelDate( hb['Fecha salida'] )
          }
          
          rs['habitaciones'] = JSON.stringify(habs)
        }

        // TOURS
        if( rs['paquetes'] > 0 ){
          let tour = jsonFile['tours'].filter(e => e['Identificador de reserva'] === rs['rb_voucher'])
          
          if( tour.length > 0 ){
            for( let tr of tour ){
              tr['Fecha entrada paquetes'] = this._h.excelDate( tr['Fecha entrada paquetes'] )
              tr['Fecha salida paquetes'] = this._h.excelDate( tr['Fecha salida paquetes'] )
            }

            rs['tours'] = JSON.stringify(tour)
          }
        }

        // TRASLADOS

        let xfer = jsonFile['traslados'].filter(e => e['Identificador de reserva'] === rs['rb_voucher'])
          
        if( xfer.length > 0 ){
          rs['traslados'] = JSON.stringify(xfer)
        }

        result['rsvas'][index].push( rs )
        i++

      }

      

      this.rb = result

      resolve( true )
    })

  }

  upload( r ){
    this.progress = []
    let arr = this.rb[r]

    for( let d of arr ){
      this.progress.push({s:0,l:0})
    }

    this.uploadArr = arr

    console.log( arr )
    this.uploadApi(arr, 0)

  }

  uploadApi( d, i ){
    this.loading['uploading'] = true
    this.progress[i]['s'] = 1

    let isLast = false

    if( i+1 == d.length ){
      isLast = true;
    }

    this._api.restfulPut( { arr: d[i], isLast }, 'Uploads/rbRsvasUpload')
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

              console.error(err.statusText, error.msg);
            });

  }

  

}
