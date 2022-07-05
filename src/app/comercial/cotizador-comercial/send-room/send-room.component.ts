import { Component, Input, OnInit } from '@angular/core';
import { ApiService, ComercialService, HelpersService, InitService } from 'src/app/services/service.index';

import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import Swal from 'sweetalert2';

import * as moment from 'moment-timezone';
import 'moment/locale/es-mx';

@Component({
  selector: 'app-send-room',
  templateUrl: './send-room.component.html',
  styleUrls: ['./send-room.component.css']
})
export class SendRoomComponent implements OnInit {

  @Input() data = []
  @Input() oportunidad: UntypedFormGroup

  loading = {}
  base64File: File

  params = {
      "idOportunidad":"0063C00000HvIjKQAV",
      "ExtensionArchivo":".pdf",
      "Titulo":"Documento de prueba",
      "rooms":[
        {
        "Divisa":"MXN",
        "Complejo":"Smart",
        "Hotel":"Smart",
        "TipoHabitacion":"Standard",
        "TipoOcupacion":"Sencilla",
        "Tarifa":"1000",
        "CantidadHabitaciones":"1",
        "FechaLlegada":"2022/12/10",
        "FechaSalida":"2022/12/18",
        "CantidadHuespedes":5,
        "Notas":"Clientes importantes"
        },
        {
        "Divisa":"MXN",
        "Complejo":"Smart",
        "Hotel":"Smart",
        "TipoHabitacion":"Standard",
        "TipoOcupacion":"Doble",
        "Tarifa":"2000",
        "CantidadHabitaciones":"1",
        "FechaLlegada":"2022/12/10",
        "FechaSalida":"2022/12/18",
        "CantidadHuespedes":5,
        "Notas":"Clientes importantes"
        }
      ],
      "base64": null
    }

  constructor(public _api: ApiService, 
    public _init: InitService, 
    public _com: ComercialService,
    public _h: HelpersService,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder) { }

  ngOnInit(): void {
  }

  async swalUpload( p ){

    const { value: file } = await Swal.fire({
      title: 'Selecciona un archivo PDF',
      input: 'file',
      inputAttributes: {
        'accept': 'application/pdf',
        'aria-label': 'Upload your pdf file'
      }
    })
    
    if (file) {

      if(file['type'] == 'application/pdf'){

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // console.log(reader.result);
            p['base64'] = reader.result
            p['base64'] = p['base64'].substring(28,100000000000000)

            Swal.close()
            this.sendRoom( p )
        };

        
        // reader.readAsDataURL(file.files[0])
      }else{
        console.error('El archivo no es PDF')
        this._init.snackbar( 'error', 'El archivo cargado no es PDF', 'ERROR')
      }
    }else{
      console.error('No existe ninguna imagen cargada')
    }

      
  }

  sendRoom( p = this.params){

    // if(  p['base64'] == null ){
    //   this.swalUpload( p )
    //   return false
    // }

    this._api.restfulPut( p , 'Sf/sendRoomOportunity' )
                .subscribe( res => {

                  this.loading['updateOp'] = false;

                  console.log( res )

                  const source = `data:application/pdf;base64,${res['extra']['base64']}`;
                  const link = document.createElement("a");
                  link.href = source;
                  link.download = `${res['extra']['Titulo']}.pdf`
                  link.click();

                  Swal.fire('Oportunidad Enviada', res['msg'], 'success')


                }, err => {
                  this.loading['updateOp'] = false;

                  const error = err.error;
                  Swal.fire('Error', error.msg, 'error')
                  console.error(err.statusText, error.msg);

                });
  }

  buildQuote( rooms ){

    let op = this.oportunidad
    let tipo = op.get('TipoRegistroNombre').value.toLowerCase()

    let inicio = moment( op.get( tipo == 'grupos' ? 'FechaInicioEstancia' : 'FechaBoda').value.format('YYYY/MM/DD') )
    let fin = op.get( tipo == 'grupos' ? 'FechaFinEstancia' : 'FechaBoda').value

    let occ = {
      1: 'Sencilla',
      2: 'Doble',
      3: 'Triple',
      4: 'Cuadruple'
    }

    let params = {
      "idOportunidad": op.get('idOportunidad').value,
      "ExtensionArchivo":".pdf",
      "Titulo": `${op.get('Nombre').value} (inicio ${ inicio.format('YYYYMMDD')  }) - ${moment().format('YYYYMMDDHHmmss')}`,
      "rooms": rooms,
      "base64": null
    }

    this.sendRoom( params )
    console.log( params )
    

  }

}
