import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ApiService, InitService } from 'src/app/services/service.index';

import { UntypedFormGroup, UntypedFormControl, Validators, FormBuilder } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import Swal from 'sweetalert2';
import { NavigationEnd, Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-payment-register',
  templateUrl: './payment-register.component.html',
  styleUrls: ['./payment-register.component.css']
})
export class PaymentRegisterComponent implements OnInit, OnDestroy {

  @Output() close = new EventEmitter()

  loading:Object = {}
  errors:Object = {}

  // FORMS
  newPayment:UntypedFormGroup
  imageForm: UntypedFormGroup

  // IMGS
  type = 'img'
  previewSrc = false
  imageFileUp: File

  params:Object = {
    complejo: null,
    proveedor: null,
    referencia: null,
    operacion: null,
    aut: null,
    monto: null,
    moneda: null
  }

  item:Object = {}
  master:any = []

  title:string
  invalidForm = true

  mySubscription: any;

  constructor(
    public _api: ApiService,
    public _init: InitService,
    private router: Router
  ) { 
    this.buildNewPayment()
    this.buildImageForm()


    // RELOAD CODE
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };

    this.mySubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Trick the Router into believing it's last link wasn't previously loaded
        this.router.navigated = false;
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.mySubscription) {
      this.mySubscription.unsubscribe();
    }
  }

  reload(){
    this.close.emit(true)
  }

  // UPLOAD FILE
  async swalUpload(){

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
        this.imageFileUp = file
        console.log(this.imageFileUp)
        Swal.close()
        // reader.readAsDataURL(file.files[0])
      }else{
        console.error('El archivo no es PDF')
        this._init.snackbar( 'error', 'El archivo cargado no es PDF', 'ERROR')
      }
    }else{
      this.previewSrc = false
      console.error('No existe ninguna imagen cargada')
    }

      
  }

  // *************** FORM BUILDERS START ***************

    buildNewPayment(){
      this.newPayment =  new UntypedFormGroup({
        ['complejo']:    new UntypedFormControl('', [ Validators.required ]),
        ['proveedor']:   new UntypedFormControl('', [ Validators.required ]),
        ['referencia']:  new UntypedFormControl('', [ Validators.required ]),
        ['operacion']:   new UntypedFormControl('', [ Validators.required ]),
        ['aut']:         new UntypedFormControl('', [ Validators.required ]),
        ['monto']:       new UntypedFormControl('', [ Validators.required ]),
        ['moneda']:      new UntypedFormControl('', [ Validators.required ]),
        ['tipo']:        new UntypedFormControl('', [ Validators.required ]),
        ['afiliacion']:  new UntypedFormControl('', [ Validators.required ]),
        ['tarjeta']:     new UntypedFormControl('Virtual', [ Validators.required ]),
        ['tipoTarjeta']: new UntypedFormControl('VIRTUAL', [ Validators.required ]),
        ['paymentNotes']: new UntypedFormControl('_')
      })

      this.newPayment.get('proveedor').valueChanges.subscribe( x => { 
        if( x != 'Roiback' && x != 'Central' ){
          this.newPayment.get('tipoTarketa').setValue('VIRTUAL')
        }
        
      })
    }

    buildImageForm(){
      this.imageForm = new UntypedFormGroup({
        fname:              new UntypedFormControl('', [ Validators.required,  ] ),
        dir:                new UntypedFormControl('', [ Validators.required,  ] ),
        imageFile:          new UntypedFormControl('', [ Validators.required,  ] )
      })
    }

  // *************** FORM BUILDERS END ***************

  build( title, dir, name ){
    this.title = title
    this.imageForm.controls['fname'].setValue(name)
    this.imageForm.controls['dir'].setValue(dir)
    this.previewSrc = false
  }

  chg(p, e){
    switch(p){
      case 'complejo':
        this.newPayment.controls['afiliacion'].setValue(`${this.newPayment.controls['proveedor'].value == 'Paypal' ? 'PP' : this.newPayment.controls['proveedor'].value == 'Tpv' ? 'TPV' : 'DP'}_${e.value}`)
        break
      case 'proveedor':
        this.newPayment.controls['tipo'].setValue(e.value)
        break
      case 'tipoTarjeta':
        this.newPayment.controls['tipoTarjeta'].setValue(e.value)
        break
    }
  }

  opValidation(){
    this.loading['saving'] = true

    let prefix = ''
    if( this.newPayment.controls['proveedor'].value == 'RB' || this.newPayment.controls['proveedor'].value == 'Central' ){
      prefix = moment().format('YYYY') + '-'
    }

    let op = prefix + this.newPayment.controls['operacion'].value

    this._api.restfulPut( { operacion: op}, 'Lists/opExists' )
                .subscribe( res => {

                  let data = res['data']

                  if( parseInt(data) == 0 ){
                    this.loading['saving'] = false;

                    if( this.newPayment.controls['proveedor'].value != 'CXC' ){
                      this.build('Voucher '+ op, op, 'voucher_'+op)
                      this.submit()
                    }else{
                      this.sendPayment()
                    }
                  }else{
                    this._init.snackbar( 'error', 'La operación ingresada ya existe con otro registro. Valida si la tu registro fue hecho con anterioridad o corrige el número de operación', 'Operación duplicada')
                    this.loading['saving'] = false;
                  }

                }, err => {
                  this.loading['saving'] = false;

                  const error = err.error;
                  this._init.snackbar( 'error', error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  deleteFile( dir, fname, ext = 'jpg' ){
    this._api.restfulDelete( `${ dir }/${ fname }/${ext}`, 'UploadImage/imageDel')
            .subscribe( res => {
              return res
            })
  }

  submit(){
    this.loading['saving'] = true
    
    let ImageFile: File = this.imageFileUp

    let formData: FormData = new FormData()
    formData.append( 'fname', this.imageForm.controls['fname'].value)
    formData.append( 'dir',   this.imageForm.controls['dir'].value)
    formData.append( 'image', ImageFile, ImageFile.name)

    let url = 'payments'

    this._api.restfulImgPost( formData, 'UploadImage/payment' )
            .subscribe( res => {
              this.loading['saving'] = false
              if( !res['ERR'] ){
                this.sendPayment()
              }else{
                this.deleteFile( `${url}/${this.imageForm.controls['dir'].value}`, this.imageForm.controls['fname'].value, 'pdf' )
              }

            })

  }

  sendPayment(){

    this.loading['saving'] = true;

    this._api.restfulPut( this.newPayment.value, 'Rsv/regPayment' )
                .subscribe( async res => {

                  this.loading['saving'] = false;

                  if( this.newPayment.get('tipo').value == 'Roiback' ){
                    await this.updateAvalonNotes()
                  }

                  if( res['data'] ){
                    this._init.snackbar( 'success', res['msg'], 'Guardado' )
                    this.close.emit( true )
                  }


                }, err => {
                  this.loading['saving'] = false;

                  const error = err.error;
                  this.deleteFile( `payments/${this.imageForm.controls['dir'].value}`, this.imageForm.controls['fname'].value, 'pdf' )
                  this._init.snackbar( 'error', error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  updateAvalonNotes(){
    return new Promise ( resolve => {

      Swal.fire({
        title: `<strong>Actualizando notas en Avalon</strong>`,
        focusConfirm: false,
        showCancelButton: false
      })
  
      Swal.showLoading()

      this._api.restfulGet( 'confirm/' + this.newPayment.get('referencia').value + '/post', 'Avalon/roibackToAvalon/' )
                .subscribe( res => {

                  Swal.close()

                  resolve( true )

                }, err => {

                  Swal.close()
                  const error = err.error;
                  this._init.snackbar( 'error', error.msg, err.status + ' // No se guardaron notas en avalon' );
                  console.error(err.statusText, error.msg);
                  resolve( false )

                });

    })
  }

}
