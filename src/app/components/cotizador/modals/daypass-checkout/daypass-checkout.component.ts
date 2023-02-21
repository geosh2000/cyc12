import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { ValidateTicketComponent } from 'src/app/components/cotizador/modals/validate-ticket/validate-ticket.component';
import { ApiService, InitService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-daypass-checkout',
  templateUrl: './daypass-checkout.component.html',
  styleUrls: ['./daypass-checkout.component.css']
})
export class DaypassCheckoutComponent implements AfterViewInit, OnChanges {

  @ViewChild( ValidateTicketComponent ) _validate: ValidateTicketComponent
  @Output() done = new EventEmitter
  @Input() rsvData = {}

  rsvForm: UntypedFormGroup = this.fb.group({ isUsd: [''] })
  namesForm: UntypedFormGroup = this.fb.group({ pax1: ['', Validators.required ] })
  mlData = []
  multipleItemsFlag = false

  namePattern = "^[A-Za-záéíóúÁÉÍÓÚ]+([\\s]{1}[A-Za-záéíóúÁÉÍÓÚ]+)*$"
  

  constructor(
    private fb: UntypedFormBuilder,
    private _api: ApiService,
    private _init: InitService,
  ) { 
    
  }

  ngAfterViewInit(): void {
    if( this.rsvData['habSelected'] ){
      this.buildForm( this.rsvData )
    }
    // console.log( this.rsvData )
  }

  ngOnChanges( changes: SimpleChanges ){
    // console.log(changes)
    if( changes['rsvData'] && changes['rsvData']['currentValue']['habSelected'] ){

      async () => {
        let curr = changes['rsvData']['currentValue']
      }

    }
  }

  async buildForm( curr ){

    console.log(this.rsvData)
    this.mlData = []

    let sum = this.rsvData['habSelected']['summarySearch']
    let tr = this.rsvData['habSelected']['daypass']
    let usd = sum['isUSD']

    let form = curr['formRsv']
    let user = form['zdUser']
    let split = form['splitNames']

    await this._validate.createForm( this.rsvData, user );

    (this.rsvForm.get('data') as UntypedFormGroup).addControl('daypass', this.fb.group({
        daypass:       this.fb.group({
          itemId:       [ { value: '', disabled: true }, Validators.required ],
          adultos:      [ { value: +(tr['cantidad_adulto'] ?? 0), disabled: false }, Validators.required ],
          juniors:      [ { value: +(tr['cantidad_junior'] ?? 0), disabled: false }, Validators.required ],
          menores:      [ { value: +(tr['cantidad_menor'] ?? 0), disabled: false }, Validators.required ],
          daypassEvent: [ { value: tr.dpe_id, disabled: false }, Validators.required ],
          fecha:        [ { value: sum.fecha, disabled: false }, Validators.required ],
          jsonPrecios:  [ { value: JSON.stringify(tr), disabled: false }, Validators.required ],
          nombreTitular:  [ { value: '', disabled: false }, Validators.required ],
          notasHotel:   [ { value: '', disabled: false } ],
        }),
        item:       this.fb.group({
          itemType:     [{ value: 17,  disabled: false }, [ Validators.required ] ],
          isQuote:      [{ value: 1,  disabled: false }, [ Validators.required ] ],
          zdTicket:     [{ value: '',  disabled: false } ],
          parentItem:   [{ value: '',  disabled: false }, form['isNew'] ? [] : [ Validators.required ] ],
        }),
        monto:    this.fb.group({
          tipoCambio:     [{ value: +(usd ? 1 : ( tr.total_mxn / tr.total_usd ) ).toFixed(2),  disabled: false }, [ Validators.required ] ],
          monto:          [{ value: +(usd ? tr.total_usd : tr.total_mxn).toFixed(2),  disabled: false }, [ Validators.required ] ],
          montoOriginal:  [{ value: +(usd ? tr.total_usd : tr.total_mxn).toFixed(2),  disabled: false }, [ Validators.required ] ],
          montoParcial:   [{ value: +(usd ? tr.total_usd : tr.total_mxn).toFixed(2),  disabled: false }, [ Validators.required ] ],
          moneda:         [{ value: usd ? 'USD' : 'MXN',  disabled: false }, [ Validators.required ] ],
          lv:             [{ value: 1,  disabled: false }, [ Validators.required ] ],
          lv_name:        [{ value: 'cc',  disabled: false }, [ Validators.required ] ],
          grupo:          [{ value: tr.dp_tipo,  disabled: false }, [ Validators.required ] ],
          promo:          [{ value: 'C',  disabled: false }, [ Validators.required ] ],
        })
      })
    )

    this.rsvForm.get('zdTicket').valueChanges.subscribe( x => { 
      this.rsvForm.get('data.daypass.item.zdTicket').setValue(x)
    })


  }


  
  getLoc( ml ){
    
    this.mlData = []

    return new Promise( (resolve) => {

      this._api.restfulGet( ml, 'Rsv/manage2Loc' )
                  .subscribe( res => {
  
                    let data = []
  
                    for( let i of res['data']['items'] ){
                      if( i['isCancel'] == 0 && i['itemType'] == 1 ){
                        data.push( i )
                      }
                    }
  
                      this.mlData = data
  
                      console.log( res['data'] )

                      resolve (true)
  
                  }, err => {
  
                    const error = err.error;
                    console.error(err.statusText, error.msg);
                    this._init.snackbar('error', err.statusText, error.msg )
  
                    resolve (false)
  
                  });
    });

  }


  getErrorMessage( ctrl, form = this.rsvForm ) {

   
    if (form.get(ctrl).hasError('required')) {
      return 'Este valor es obligatorio';
    }
    
    if (form.get(ctrl).hasError('email')) {
      return 'El valor debe tener formato de email';
    }
    
    if (form.get(ctrl).hasError('minlength')) {
      return 'El nombre escrito es demasiado corto';
    }
    
    if (form.get(ctrl).hasError('min')) {
      return 'El valor debe ser mayor o igual a ' + form.get(ctrl).errors.min.min;
    }
    
    if (form.get(ctrl).hasError('max')) {
      return 'El valor debe ser menor o igual a ' + form.get(ctrl).errors.max.max;
    }
    
    if (form.get(ctrl).hasError('pattern')) {
      return 'Ingresa un numero telefónico válido. puedes iniciar con "+". Recuerda no incluir "espacios" ni "-"';
    }
    
    if (form.get(ctrl).hasError('finMenorIgual')) {
      return 'La fecha final debe ser mayor al inicio';
    }
    
    if (form.get(ctrl).hasError('inicioPasado')) {
      return 'La fecha inicial no puede ser en el pasado';
    }
    
    return 'El campo tiene errores';
  }

  doneEmit(){
    this.done.emit( true )
  }

  


}


