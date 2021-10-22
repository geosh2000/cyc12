import { Component, OnInit, ViewChild } from '@angular/core';
import { utils, read as readXlsx } from 'xlsx';

import { ApiService } from 'src/app/services/service.index';

import { UploadCieloComponent } from './upload-cielo/upload-cielo.component';
import { UploadLoyaltyComponent } from './upload-loyalty/upload-loyalty.component';

import Swal from 'sweetalert2';


@Component({
  selector: 'app-uploads',
  templateUrl: './uploads.component.html',
  styleUrls: ['./uploads.component.css']
})
export class UploadsComponent implements OnInit {

  @ViewChild( UploadCieloComponent ) private _cielo: UploadCieloComponent
  @ViewChild( UploadLoyaltyComponent ) private _loyalty: UploadLoyaltyComponent

  upList = []
  selectedType:any


  constructor(
    private _api:ApiService
  ) { }

  ngOnInit(): void {
    this.getUploadsList()
  }

  async swalUpload(){

    const { value: file } = await Swal.fire({
      title: 'Selecciona un archivo XLS',
      input: 'file',
      inputAttributes: {
        'accept': 'application/vnd.ms-excel,application/officedocument.spreadsheetml.sheet',
        'aria-label': 'Upload your xls file'
      }
    })
    
    if (file) {
      Swal.fire({
        title: `<strong>Construyendo información</strong>`,
        focusConfirm: false,
        showCancelButton: false,
      })

      Swal.showLoading()

      this.buildForms( this.selectedType, file )

    }
    
  }



  getUploadsList(){
    this._api.restfulGet( '', 'Lists/uploadsList' )
            .subscribe( res => {
              this.upList = res['data']
            },
            err => {
              const error = err.error;
              Swal.fire('Error', error.msg, 'error' );
              console.error(err.statusText, error.msg);
            });
  }

  buildForms( type, file ){

      console.log('build start')
      console.log(file)

      let fileReader = new FileReader();
      
      fileReader.readAsArrayBuffer( file );
      
      fileReader.onload = async () => {
            let arrayBuffer:any
            
            arrayBuffer = fileReader.result;
            
            let data = new Uint8Array( arrayBuffer );
            let arr = new Array();

            for(let i = 0; i != data.length; ++i){
              arr[i] = String.fromCharCode(data[i]);
            }

            let bstr = arr.join('');
            let workbook

            switch( type ){
              case 'cieloLlegadas':
                workbook = readXlsx(bstr, {type:'string'});
                break
              default:
                workbook = readXlsx(data, {type:'array'});
                break
            }

            let sheetName = workbook.SheetNames[0]
            let jsonFile = utils.sheet_to_json( workbook.Sheets[sheetName], {raw: true, defval:null} )
            let xlsJson = jsonFile
            let flag:any

            switch( type ){
              case 'cieloLlegadas':
                flag = await this._cielo.buildVouchers(jsonFile)
                Swal.close()
                // this.loading['building'] = false
                break;
                case 'loyaltyRB':
                flag = await this._loyalty.buildVouchers(jsonFile)
                Swal.close()
                // this._loyalty.buildVouchers(jsonFile)
                // this.loading['building'] = false
                break;
              default:
                console.log('process not defined', jsonFile)
                Swal.close()
            }

      }

  }

}
