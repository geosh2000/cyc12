import { Component, OnInit } from '@angular/core';
import { ApiService, InitService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';
import { utils, read as readXlsx } from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-upload-assistcard-invoices',
  templateUrl: './upload-assistcard-invoices.component.html',
  styleUrls: ['./upload-assistcard-invoices.component.css']
})
export class UploadAssistcardInvoicesComponent implements OnInit {

  progress  = []
  assistList    = {}
  rawList    = []
  uploadArr = []
  loading   = {}
  summary   = {}
  allRegs   = 0

  // Suggested 5000
  maxRegs = 5000

  rawData = {}

  constructor(
      public _api:ApiService,
      private _init:InitService
    ) { }

  ngOnInit(): void {
  }

  getSheet( wb, i ){

    if( wb.SheetNames[i] ){
      let sheetName = wb.SheetNames[i]
      let jsonFile = utils.sheet_to_json( wb.Sheets[sheetName], {raw: true, defval:null} )
      console.log( jsonFile )
      return jsonFile
    }else{
      return false
    }

  }

  async preBuild( workbook ){
    let sheets = {}

    if( workbook.SheetNames[5] ){
      sheets['start'] = [{[workbook.Sheets[workbook.SheetNames[0]]['A1']['v']]: 1}]

      sheets['folio'] = await this.searchSheets( workbook, 'folio' )
      if( sheets['folio'].length == 0 ){
        delete sheets['folio']
      }

      sheets['nc'] = await this.searchSheets( workbook, 'nc' )
      if( sheets['nc'].length == 0 ){
        delete sheets['nc']
      }

      sheets['detail'] = await this.searchSheets( workbook, 'detail' )
      if( sheets['detail'].length == 0 ){
        delete sheets['detail']
      }

      sheets['montos'] = await this.searchSheets( workbook, 'montos' )
      if( sheets['montos'].length == 0 ){
        delete sheets['montos']
      }
      sheets['end'] = this.getSheet( workbook, 7)
    }else{
      sheets['start'] = this.getSheet( workbook, 0)
      sheets['end'] = this.getSheet( workbook, 1)
    }

    this.buildVouchers( sheets, workbook )
  }

  searchSheets( wb, field ){

    return new Promise(async resolve => {

      let map = {
        'detail': 'cantidad',
      }

      let i = 0
      for( let s of wb.SheetNames ){
        let fc = wb.Sheets[s]['A1']['v']

        switch( field ){
          case 'detail':
            if( fc.toLowerCase() == map[field] ){
              resolve( this.getSheet( wb, i) )
            }
            break
          case 'folio':
            if( fc.substring(0,8).toLowerCase() == 'este doc' ){
              resolve( [{[wb.Sheets[s]['A1']['v']]: 1}] )
            }
            break
          case 'nc':
            if( fc.substring(0,15).toLowerCase() == 'total con letra' ){
              resolve( [{[wb.Sheets[s]['A1']['v']]: 1}] )
            }
            break
          case 'montos':
            console.log( 'sheet montos', fc )
            if( fc.toLowerCase() == 'subtotal:' ){
              resolve( this.getSheet( wb, i) )
            }
            break
        }

        i++
      }

      resolve( [] )
    })

  }

  buildVouchers( sh, wb ){

    this.rawData = wb
    return new Promise(async resolve => {

      let json = []

      this.progress = []
      this.loading['assist'] = true

      this.summary = { 
          total: 0,
          mail_subsriber_true: 0,
          mail_subsriber_false: 0
        }

      this.allRegs = 0

      this.assistList = []
      let cielo = [[]]
      let cieloRaw = []
      let index = 0
      let i = 0

      let singleSheet = !sh['detail']

      let sumData = ''
      for( let c in sh['start'][0] ){ 
        sumData = c
        break
      } 

      let tipo = sumData.match(/^Tipo de Comprobante:\s*(.{1,20})\r/);
      let fecha = sumData.match(/^.*Fecha: (.{11})/m);
      let factura = sumData.match(/^.*(.{6})\r\nFecha/m);

      let itms = []
      let res = {
        isCreditNote: tipo[1] == 'E - Egreso' ? 1 : 0,
        // fecha: fecha[1],
        factura: factura[1].trim(),
        fecha_emision: this.turnDate( fecha[1], 'YYYY-MM-DD' ),
        fas_items: ''
      }

      console.log(sh)
      let itemCol = '__EMPTY_2'
      if( singleSheet ){
        if( !sh['end'] ){
          itemCol = '__EMPTY_4'
        }else{

          for( let r of sh['end'] ){
            for( let c in r ){
  
                // Folio
                if( typeof r[c] == 'string' ){
                  let folio = r[c].match(/^.*Folio Fiscal:\s*(.*)/m);
                  if( folio && folio[1] ){
                    res['folio_fiscal'] = folio[1].trim()
                  }
                  
                  let related = r[c].match(/^.*documentos relacionados\s*(.*)/m);
                  if( related && related[1] ){
                    res['folio_related'] = related[1].trim().substring(0,related[1].length-1)
                  }
                }
    
                // Totales
                if( typeof r[c] == 'string' ){
    
                  switch(r[c]){
                    case 'Subtotal:':
                      res['fas_neta'] = r['__EMPTY']
                      break
                    case 'Total:':
                      res['fas_tax'] = r['__EMPTY']
                      break
                  }
      
                }
                
              }
            }

            if( !res['fas_neta'] ){
              // NETA
              for( let c in sh['end'][0] ){
                console.log(c)
                if( c.match(/^\$/) ){
                  res['fas_neta'] = c.substring(1,100)
                  break
                }
              }

              // TAX
              for( let c in sh['end'][2] ){
                console.log(c)
                if( c.match(/^\$/) ){
                  res['fas_tax'] = sh['end'][2][c]
                  break
                }
              }
            }
        }
        
      }else{
        for( let c in sh['nc'][0] ){
          if( typeof c == 'string' ){
            let related = c.match(/^.*documentos relacionados\s*(.*)/m);
            if( related && related[1] ){
              res['folio_related'] = related[1].trim().substring(0,related[1].length-1)
            }
          }
        }
        
        for( let c in sh['folio'][0] ){
          if( typeof c == 'string' ){
            let folio = c.match(/^.*Folio Fiscal:(.*)/m);
            if( folio && folio[1] ){
              res['folio_fiscal'] = folio[1].trim()
            }
          }
        }
        
        // NETA
        for( let c in sh['end'][0] ){
          console.log(c)
          if( c.match(/^\$/) ){
            res['fas_neta'] = c.substring(1,100)
            break
          }
        }

        // TAX
        for( let c in sh['end'][2] ){
          console.log(c)
          if( c.match(/^\$/) ){
            res['fas_tax'] = sh['end'][2][c]
            break
          }
        }

        // ITEMS
        for( let r of sh['detail'] ){
          for( let c in r ){
            if( c.substring(0,10) == 'Clave Prod' ){
              let itm = r[c].match(/^.*- 520(.*)/s);
              if( itm && itm[1] ){
                itms.push(itm[1].trim())
              }
            }
          }
        }
      }

      let z = 0
      for( let r of sh['start'] ){

        // SPLIT BATCH TO UPLOAD
        if( i == this.maxRegs ){
          cielo.push([])
          index++
          i = 0
        }

        cieloRaw.push(r)

        // let tipo = "afskfsd33j"
        // var test = tesst.match(/a(.*)j/);
        // alert (test[1]);
        let cols = []
        let ci = 0
        
        for( let c in r ){
          if( ci != 0 ){
            cols.push(c)
          }else{

            // Folio
            if( typeof r[c] == 'string' ){
              let folio = r[c].match(/^.*Folio Fiscal:\s*(.*)/m);
              if( folio && folio[1] ){
                res['folio_fiscal'] = folio[1].trim()
              }
              
              let related = r[c].match(/^.*documentos relacionados\s*(.*)/m);
              if( related && related[1] ){
                res['folio_related'] = related[1].trim().substring(0,related[1].length-1)
              }
            }

            // Totales
            if( typeof r[c] == 'string' ){

              switch(r[c]){
                case 'Subtotal:':
                  res['fas_neta'] = r['__EMPTY_1']
                  break
                case 'Total:':
                  res['fas_tax'] = r['__EMPTY_1']
                  break
              }
  
            }
            
          }
          ci++
        }

        if( r['__EMPTY'] == 'DAY' ){
          let itm = r[itemCol].match(/^.*- 520(.*)/s);
          if( itm && itm[1] ){
            itms.push(itm[1].trim())
          }
        }
        let registry = res

        cielo[index].push(registry)
        i++
        z++

        // console.log(i, r['Id'])
        this.summary['total']++

        this.allRegs++
      }

      res['fas_items'] = "[" + itms.join() + "]"
      this.rawList = cieloRaw
      this.assistList = res
      this.loading['assist'] = false

      console.log(sh)
      if( (!res['fas_tax'] || res['fas_tax'] == null) && sh['montos'] ){
        for( let r of sh['montos'] ){
          
          console.log( 'calculando neta', r )	
          if( r['Subtotal:'].toLowerCase() == 'total:' ){
            for( let i in r ){
              if( i.toLowerCase() != 'subtotal:' ){
                res['fas_neta'] = parseFloat(i.substring(1,100).replace(/,/g, '')).toFixed(2)
                res['fas_tax'] = r[i] 
              }
            }
          }

          if( typeof r[0] == 'string' && r[0].toLowerCase() == 'total:' ){
            res['fas_tax'] = r[1]
          }
        }
      }

      // console.log(this.assistList)
      // console.log(this.summary)
      resolve( true )

    })

  }

  validateText( t, trim, nt){
    return t ? (trim ? String(t).trim() : (t == ' ' ? null : t)) : nt
  }

  excelDate( excelDate, dtime = false ) {

    if( excelDate == null || excelDate == '' ){
      return null
    }

    if( dtime ){
      return moment(new Date((Math.round(excelDate) - (25567 + 1))*86400*1000).toLocaleDateString('en-US'), 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
    }else{
      return moment(new Date((Math.round(excelDate) - (25567 + 1))*86400*1000).toLocaleDateString('en-US'), 'DD/MM/YYYY').format('YYYY-MM-DD');
    }
  }

  upload( ){
    
    this._api.restfulPut( this.assistList, 'Uploads/assistFacturas')
            .subscribe( res => {

              this._init.snackbar('success', 'Factura Guardada', 'Cerrar')
            },
            err => {

              const error = err.error;
              this._init.snackbar('error', error.msg, 'Cerrar')
              console.error(err.statusText, error.msg);
            });

  }


  turnDate( d, f ){
    let months = {
      ene: 1,
      feb: 2,
      mar: 3,
      abr: 4,
      may: 5,
      jun: 6,
      jul: 7,
      ago: 8,
      sep: 9,
      oct: 10,
      nov: 11,
      dic: 12,
    }

    let day = d.substring(0,2)
    let month = d.substring(3,6)
    let year = d.substring(7,100)

    let date = year +'/' + months[month.toLowerCase()] + '/' + day

    return moment(date).format( f )
    
  }
}
