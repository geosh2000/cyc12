import { Component, OnInit } from '@angular/core';

import { saveAs } from "file-saver";
import { Document, Header, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, SectionType } from "docx";
import * as moment from 'moment-timezone'
import { ApiService } from 'src/app/services/service.index';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-generate-auth-file',
  templateUrl: './generate-auth-file.component.html',
  styleUrls: ['./generate-auth-file.component.css']
})
export class GenerateAuthFileComponent implements OnInit {

  data = {
    nombre: 'Jorge Alberto Sanchez',
    fecha: moment().format('YYYY-MM-DD'),
    localizadores: ['123456', '136789'],
    monto: 1345,
    moneda: 'USD'
  }

  
  constructor( private _api: ApiService  ) { }

  ngOnInit(): void {
    console.log('Run doc example')
    this.genFile()
  }

  genFile(){
    // Documents contain sections, you can have multiple sections per document, go here to learn more about sections
    // This simple example will only contain one section
    const doc = new Document({
      sections: [{

        // HEADERS
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                        text: "FORMATO DE AUTORIZACION DE CARGO",
                        font: "Calibri",
                        bold: true,
                    }),
                    new TextRun({
                        text: "OASIS HOTELS & RESORTS",
                        font: "Calibri",
                        break: 1,
                        bold: true,
                    }),
                  ],
                  heading: HeadingLevel.HEADING_1,
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          },
          children: []
        },
        
        // Fecha
        {
          properties: { type: SectionType.CONTINUOUS },
          children: [
              new Paragraph({
                children: [
                  new TextRun({
                      text: this.data.fecha,
                      font: "Calibri",
                      size: 22,
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
          ],
        },
        
        // Fecha
        {
          properties: { type: SectionType.CONTINUOUS },
          children: [

              // SALUDO
              new Paragraph({
                children: [
                  new TextRun({
                      text: `Estimado ${ this.data.nombre }:`,
                      font: "Calibri",
                      size: 22,
                      break: 1
                  })
                ],
                alignment: AlignmentType.JUSTIFIED,
              }),

              // Parrafo 1
              new Paragraph({
                children: [
                  new TextRun({
                      text: `Por motivo de seguridad y protección de datos al tarjetahabiente, será necesario nos envíe la siguiente documentación:`,
                      font: "Calibri",
                      size: 22,
                      break: 1
                  }),
                  new TextRun({
                      text: ``,
                      font: "Calibri",
                      size: 22,
                      break: 1
                  })
                ],
                alignment: AlignmentType.JUSTIFIED,
              }),

              // BULLETS REQUISITOS
              new Paragraph({
                children: [
                  new TextRun({
                      text: `Identificación oficial del tarjetahabiente`,
                      font: "Calibri",
                      size: 22
                  })
                ],
                bullet: { level: 0 },
                alignment: AlignmentType.JUSTIFIED,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                      text: `Formato de autorización de cargo`,
                      font: "Calibri",
                      size: 22,
                  })
                ],
                bullet: { level: 0 },
                alignment: AlignmentType.JUSTIFIED,
              }),

              // Parrafo 2
              new Paragraph({
                children: [
                  new TextRun({
                      text: `Esta solicitud tiene como fin poder procesar el pago ${ this.data.localizadores.length > 1 ? 'de los localizadores' : 'del localizador' } ${ this.data.localizadores.join(', ') } por la cantidad de $${ this.data.monto } ${ this.data.moneda } a la tarjeta terminación ___________________`,
                      font: "Calibri",
                      size: 22,
                      break: 1
                  })
                ],
                alignment: AlignmentType.JUSTIFIED,
              }),

              // Parrafo 3
              new Paragraph({
                children: [
                  new TextRun({
                      text: `Le informamos que la reservación está pendiente de confirmación hasta que recibamos el formato de autorización de cargo con la documentación antes mencionada.`,
                      font: "Calibri",
                      size: 22,
                      break: 1
                  })
                ],
                alignment: AlignmentType.CENTER,
              }),
          ],
        },

        // FORMATO DE AUTORIZACION
        {
          properties: { type: SectionType.CONTINUOUS },
          children: [

              // TITULO
              new Paragraph({
                children: [
                  new TextRun({
                      text: "FORMATO DE AUTORIZACIÓN",
                      font: "Calibri",
                      break: 2,
                      bold: true
                  }),
                ],
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
              }),

              // Parrafo 1
              new Paragraph({
                children: [
                  new TextRun({
                      text: `Yo  __________________________ autorizo realizar el cargo por la cantidad de $______________`,
                      font: "Calibri",
                      size: 22,
                      break: 2,
                  }),
                  new TextRun({
                      text: `Por concepto de pago ${ this.data.localizadores.length > 1 ? 'de los localizadores' : 'del localizador' } _____________________________________`,
                      font: "Calibri",
                      size: 22,
                      break: 1
                  }),
                  new TextRun({
                      text: `a la tarjeta con terminación`,
                      font: "Calibri",
                      size: 22,
                      break: 1
                  }),
                  new TextRun({
                      text: ` (favor de ingresar los 4 últimos dígitos de la parte de enfrente)`,
                      font: "Calibri",
                      italics: true,
                      color: '#A6A6A6',
                      size: 18
                  }),
                  new TextRun({
                      text: ` ___________________`,
                      font: "Calibri",
                      size: 22
                  }),
                ],
                alignment: AlignmentType.JUSTIFIED,
              }),

              // SUBTITULO
              new Paragraph({
                children: [
                  new TextRun({
                      text: "Favor de llenar los siguientes datos",
                      font: "Calibri",
                      break: 2,
                      bold: true
                  }),
                ],
                heading: HeadingLevel.HEADING_3,
                alignment: AlignmentType.LEFT,
              }),
              
              // BULLETS
              new Paragraph({
                children: [
                  new TextRun({
                      text: ``,
                      font: "Calibri",
                      size: 22,
                      break: 3,
                  }),
                ],
                alignment: AlignmentType.LEFT,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                      text: `Nombre de titular de la tarjeta.       ______________________________________`,
                      font: "Calibri",
                      size: 22,
                  }),
                ],
                bullet: { level: 0 },
                alignment: AlignmentType.LEFT,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Fecha:                                                   ______________________________________`,
                      font: "Calibri",
                      size: 22,
                  }),
                ],
                bullet: { level: 0 },
                alignment: AlignmentType.LEFT,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                      text: `Nombre del titular de la reserva.      ______________________________________`,
                      font: "Calibri",
                      size: 22,
                  }),
                ],
                bullet: { level: 0 },
                alignment: AlignmentType.LEFT,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                      text: `Vigencia de la tarjeta con la que se realizará el pago: ________________________`,
                      font: "Calibri",
                      size: 22,
                  }),
                ],
                bullet: { level: 0 },
                alignment: AlignmentType.LEFT,
              }),
          ],
        },

        // FIRMA
        {
          properties: { type: SectionType.CONTINUOUS },
          children: [

              // TITULO
              new Paragraph({
                children: [
                  new TextRun({
                      text: "______________________________________________",
                      font: "Calibri",
                      break: 4
                  }),
                  new TextRun({
                      text: "Nombre y firma del titular de la tarjeta",
                      font: "Calibri",
                      size: 22,
                      break: 1
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
          ],
        },
      ],
    });

    // Used to export the file into a .docx file
    // Packer.toBuffer(doc).then((buffer) => {
    //   fs.writeFileSync("My Document.docx", buffer);
    // });


    Packer.toBlob(doc).then(blob => {
      console.log(blob);

      this.submit( blob );
      // saveAs(blob, "formato de autorizacion de cargo.docx");
      console.log("Document created successfully");
    });

    console.log("Done! A file called 'My Document.docx' will be in your file system.")
    // Done! A file called 'My Document.docx' will be in your file system.
  }

  submit( f ){

    let fd = new FormData();
    fd.append('fname', 'fac_php');
    fd.append( 'dir',   'formatos')
    fd.append( 'data', f);
    let file = f

    let url = 'payments'

    console.log('uploading file')
    this._api.restfulImgPost( fd, 'UploadImage/formatos' )
            .subscribe( res => {

              if( res['ERR'] ){
                Swal.fire('Error!', res['msg'], 'error')
              }else{
                Swal.fire('Archivo guardado en servidor', `Nombre y ruta del archivo: ${ res['route']}`, 'success')
              }

            })

  }

}