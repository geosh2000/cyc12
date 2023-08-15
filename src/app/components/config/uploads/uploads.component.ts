import { Component, OnInit, ViewChild } from '@angular/core';
import { utils, read as readXlsx } from 'xlsx';

import { ApiService } from 'src/app/services/service.index';

import { UploadCieloComponent } from './upload-cielo/upload-cielo.component';
import { UploadLoyaltyComponent } from './upload-loyalty/upload-loyalty.component';

import Swal from 'sweetalert2';
import { UploadComplementosComponent } from './upload-complementos/upload-complementos.component';
import { UploadDesplazosComponent } from './upload-desplazos/upload-desplazos.component';
import { UploadRoibackComponent } from './upload-roiback/upload-roiback.component';
import { UploadAssistcardInvoicesComponent } from './upload-assistcard-invoices/upload-assistcard-invoices.component';
import { UploadParatyMlsComponent } from './upload-paraty-mls/upload-paraty-mls.component';


@Component({
  selector: 'app-uploads',
  templateUrl: './uploads.component.html',
  styleUrls: ['./uploads.component.css']
})
export class UploadsComponent implements OnInit {

  @ViewChild( UploadCieloComponent ) private _cielo: UploadCieloComponent
  @ViewChild( UploadLoyaltyComponent ) private _loyalty: UploadLoyaltyComponent
  @ViewChild( UploadComplementosComponent ) private _complementos: UploadComplementosComponent
  @ViewChild( UploadDesplazosComponent ) private _desplazos: UploadDesplazosComponent
  @ViewChild( UploadRoibackComponent ) private _rb: UploadRoibackComponent
  @ViewChild( UploadParatyMlsComponent ) private _prtMls: UploadParatyMlsComponent
  @ViewChild( UploadAssistcardInvoicesComponent ) private _aci: UploadAssistcardInvoicesComponent

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

      // console.log('build start')
      // console.log(file)

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
                try {
                  workbook = readXlsx(bstr, {type:'string'})
                } catch (error) {
                  console.error( error )
                  Swal.fire('Error', 'Archivo corrupto o tipo de archivo incorrecto', 'error')
                  return false
                }
                break
              default:
                try {
                  workbook = readXlsx(data, {type:'array'})
                } catch (error) {
                  console.error( error )
                  Swal.fire('Error', 'Archivo corrupto o tipo de archivo incorrecto', 'error')
                  return false
                }
                break
            }

            let sheetName = workbook.SheetNames[0]
            let jsonFile = utils.sheet_to_json( workbook.Sheets[sheetName], {raw: true, defval:null} )
            let xlsJson = jsonFile
            let flag:any

            console.log(workbook)

            switch( type ){
              case 'cieloLlegadas':
                flag = await this._cielo.buildVouchers(jsonFile)
                Swal.close()
                break;
              case 'loyaltyRB':
                flag = await this._loyalty.buildVouchers(jsonFile)
                Swal.close()
                break;
              case 'complementos':
                flag = await this._complementos.buildVouchers(jsonFile)
                Swal.close()
                break;
              case 'desplazos':
                flag = await this._desplazos.buildVouchers(jsonFile)
                Swal.close()
                break;
              case 'paratyMls':
                flag = await this._prtMls.buildVouchers(workbook)
                Swal.close()
                break;
              case 'rsvasRb':
                flag = await this._rb.buildVouchers(workbook)
                Swal.close()
                break;
              case 'acInvoices':

                flag = await this._aci.preBuild( workbook )
                Swal.close()
                break;
              default:
                console.error('process not defined', jsonFile)
                Swal.close()
            }

      }

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

  handleDrop(event) {
    // event.preventDefault();
    const file = event.addedFiles;

    console.log( 'dropped', file )
    if (file.length > 0) {
      this.buildForms( this.selectedType, file[0] )
    }
  }

}
