import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { InitService } from 'src/app/services/init.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-do-payment',
  templateUrl: './do-payment.component.html',
  styleUrls: ['./do-payment.component.css']
})
export class DoPaymentComponent  {

  loadX = 0
  reference = ''
  referenceId = ''
  loading = {
    'paymodule' : true
  }

  setLang = 'en'
  lang = [
    {code: 'en', lang: 'English'},
    {code: 'es', lang: 'Español'},
    {code: 'pt', lang: 'Português'},
  ]

  text = {
    en :{
      advisory: 'Before proceeding with your payment, please read and accept our',
      terms: 'Terms & Conditions',
      accept: 'Accept'
    },
    es: {
      advisory: 'Antes de continuar con tu pago, por favor lee y acepta nuestros',
      terms: 'Terminos y Condiciones',
      accept: 'Acepto'
    },
    pt: {
      advisory: 'Para continuar com o seu pagamento, leia e aceite os nossos',
      terms: 'Termos e Condicoes',
      accept: 'Eu aceito'
    }
  }

  conditions = {
    en: [
        "I know and accept the modification / cancellation / no-show policies of my reservation",
        "All refunds are subject to penalties acoording to contract policies"
    ],
    es: [
      "Conozco y acepto las políticas de modificación / cancelación / no-show de mi reserva",
      "Todo reembolso está sujeto a penalidades de acuerdo a las polìticas del contrato"
    ],
    pt: [
      "Eu conheço e aceito as políticas de modificação / cancelamento / não comparecimento da minha reserva",
      "Todo reembolso está sujeito a penalidades de acordo com as políticas do contrato"
    ],
  }

  acceptTerms = false
  disableTerms = false

  link = ''

  constructor( 
    private router: Router, 
    private titleService: Title,
    private activatedRoute: ActivatedRoute,
    private _api: ApiService,
    private _init: InitService
    ) { 
    
      
      this.router.events
        .pipe(
          filter( event => event instanceof ActivationEnd ),
          filter( (event: ActivationEnd) => event.snapshot.firstChild === null ),
          map( (event: ActivationEnd) => event.snapshot.data ),
        )
        .subscribe( data => {
    
          this.activatedRoute.params.subscribe( params => {
            let flag = false

            if ( params.ref ){
              if( params.ref != this.reference ){
                this.reference = params.ref;  
                flag = true      
                this.link = ''
                // console.log('ref change', params.ref)
              }
            }
            
            if ( params.id ){
              if( params.id != this.referenceId ){
                this.referenceId = params.id;   
                flag = true     
                this.link = ''
                // console.log('id change', params.id)
              }
            }

            if( flag ){
              this.getLink( this.reference, this.referenceId )
            }

          });

          // SET TITLE
          if( data.title ){
            this.titleService.setTitle( data.title + ' - ' + this.reference );
          }else{
            this.titleService.setTitle( 'CyC' );
          }
        })

    }

  accept(){
    if( !this.acceptTerms ){
      // console.log('load module')
      this.loading['paymodule'] = true
    }

    // this.acceptTerms = !this.acceptTerms
  }

  loaded( e ){
    if( this.loadX > 0 ){
      this.loading['paymodule'] = false
    }
    this.disableTerms = true;
    this.loadX ++
  }

  showTerms(){

    let terms = ''

    for( let t of this.conditions[this.setLang] ){
      terms += `<li>${t}</li>`
    }

    Swal.fire({
      title: `<strong>${ this.text[this.setLang]['terms'] }</strong>`,
      icon: 'info',
      html:
        `<ul>${ terms }</ul>`,
      focusConfirm: true,
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cerrar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.acceptTerms = true
        this.loading['paymodule'] = true
      }
    })
  }

  getLink( ref, id ) {

    this.loading['link'] = true;
    this.link = ''


    this._api.restfulPut( { id, ref }, 'Pagos/manualPayment' )
                .subscribe( res => {

                  this.loading['link'] = false;
                  this.link = res['data']['link']

                }, err => {
                  this.loading['link'] = false;

                  const error = err.error;

                  this.askValues( error.msg )
                  console.error(error.msg);

                });
  }

  async askValues( err ) {
    const { value: formValues } = await Swal.fire({
      title: err,
      icon: 'error',
      html:
        `<p>Ingresa los datos proporcionados por tu agente:</p>` +
        `<div class="input-group mb-3">
          <span style="min-width: 105px;" class="input-group-text" id="basic-addon3">Referencia</span>
          <input type="text" id="swal-reference" class="form-control">
        </div>
        <div class="input-group mb-3">
          <span style="min-width: 105px;" class="input-group-text" id="basic-addon3">Id</span>
          <input type="text" id="swal-id" class="form-control">
        </div>`,
      focusConfirm: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      preConfirm: () => {
        return [
          (<HTMLInputElement>document.getElementById('swal-reference')).value,
          (<HTMLInputElement>document.getElementById('swal-id')).value
        ]
      }
    })

    if ( formValues ) {
      if( formValues[0] == '' || formValues[1] == '' ){
        Swal.fire('Error', 'Debes introducir ambos campos', 'error')
        .then( () => {
          this.askValues( err )
        })
      }else{
        this.router.navigate(['/doPayment',formValues[0], formValues[1]]);
      }
    }
  }



}