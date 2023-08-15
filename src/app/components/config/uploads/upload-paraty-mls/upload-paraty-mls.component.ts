import { Component, OnInit } from '@angular/core';
import { ApiService, HelpersService, InitService } from 'src/app/services/service.index';
import { utils, read as readXlsx } from 'xlsx';

@Component({
  selector: 'app-upload-paraty-mls',
  templateUrl: './upload-paraty-mls.component.html',
  styleUrls: ['./upload-paraty-mls.component.css']
})
export class UploadParatyMlsComponent implements OnInit {

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

  invertirFecha(texto: string): string {

    if( typeof texto === "string" ){
      const patron = /(\d{2})\/(\d{2})\/(\d{4})/g;
      const nuevoTexto = texto.replace(patron, (match, dia, mes, año) => {
        return `${año}/${mes}/${dia}`;
      });
      return nuevoTexto.replace(/[\/]/g, letra => 
        '-'['/'.indexOf(letra)].replace(/\s/g, '')
      );
    }

    return texto
  }

  capitalizeWords(texto: string): string {
    const palabras = texto.split(' ');
    const palabrasCapitalizadas = palabras.map(palabra => {
      const primeraLetra = palabra.charAt(0).toUpperCase();
      const restoPalabra = palabra.slice(1);
      return primeraLetra + restoPalabra;
    });
    return palabrasCapitalizadas.join(' ');
  }

  quitarAcentos(texto: string): string {
    let rstl = this.capitalizeWords(texto.replace(/[áéíóúÁÉÍÓÚüÜñÑ]/g, letra => 
      'aeiouAEIOUuUuNn'['áéíóúÁÉÍÓÚüÜñÑ'.indexOf(letra)])
    );

    return this.quitarSimbolos(rstl)
  }
  
  quitarSimbolos(texto: string): string {
    return texto.replace(/[\%\(\)€\s]/g, letra => 
      'P    '['%()€ '.indexOf(letra)].replace(/\s/g, '')
    );
  }

  buildVouchers( og_wb ){

    return new Promise(async resolve => {

      let pre_sheet = og_wb.Sheets[og_wb.SheetNames[0]]
      let pre_data = utils.sheet_to_json(pre_sheet, { header: 1 });
      pre_data.splice(0, 6);
      let ws = utils.json_to_sheet(pre_data);

      let jsonFile = utils.sheet_to_json( ws, {raw: true, defval:null} )

      let rindex = 0
      let xlsFile = []
      let titles = jsonFile[0]
      for( let row of jsonFile ){
       
        if( rindex == 0 ){ rindex++; continue }

        let el: {} = row
        let arr = {}
        
        for( let c in el ){
          arr[ this.quitarAcentos(titles[c]) ] = this.invertirFecha(el[c])
        }

        xlsFile.push( arr )
        
        
        rindex++
      }

      let result = {
        'rsvas': [[]]
      }

      let index = 0
      let i = 0

      for( let tr of xlsFile ){

        if( i == 500 ){
          result['rsvas'].push([])
          index++
          i = 0
        }

        result['rsvas'][index].push( tr )
        i++

      }

      this.rb = result

      console.log( this.rb )

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

    this._api.restfulPut( { arr: d[i], isLast }, 'Uploads/prtMlsUpload')
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

