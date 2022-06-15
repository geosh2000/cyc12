import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ApiService, InitService } from 'src/app/services/service.index';
import { MergeUsersComponent } from '../../../shared/merge-users/merge-users.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-validate-ticket',
  templateUrl: './validate-ticket.component.html',
  styleUrls: ['./validate-ticket.component.css']
})
export class ValidateTicketComponent implements OnInit, OnChanges {

  @ViewChild( MergeUsersComponent ) _merge:MergeUsersComponent

  @Input() item: UntypedFormGroup

  @Input() user

  @Input() rsvForm = this.fb.group({})
  @Output() rsvFormChange = new EventEmitter()
  @Output() setTicket = new EventEmitter()

  @Output() done = new EventEmitter()

  zdTicket: UntypedFormGroup = this.fb.group({ ticket: [''] })
  zdTicketName = ''

  constructor(
    private fb: UntypedFormBuilder,
    private _api: ApiService,
    private _init: InitService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // console.log(this.item)
  }

  ngOnChanges( changes: SimpleChanges ){
    // console.log(changes)
  }

  async validateTicket( submit = false ){

      let user = await this.getZdUser( this.user )

      return new Promise ( async resolve => {
        let ticket = await this.getTicket( this.zdTicket.get('ticket').value, true, user, submit )
    
        if( ticket ){
          this.item.get('zdTicket').setValue( ticket['id'] )
          this.zdTicketName = `(${ ticket['id'] }) ${ticket['subject']}`
        }else{
          this.item.get('zdTicket').setValue('')
          this.zdTicketName = ''
          resolve(false)
        }
    
        if( submit ){
          resolve(true)
        }
      })

  }

  chgTicket(){
    this.item.get('zdTicket').setValue('')
    this.zdTicketName = ''
  }

  getTicket( t, c = false, d: any, f = false ){

    Swal.fire({
      title: "Buscando Ticket",
      showCancelButton: false,
      showConfirmButton: false
    })

    Swal.showLoading()

    return new Promise( resolve => {

      this._api.restfulGet( t, 'Calls/viewTicketSide' )
                  .subscribe( async res => {

                    Swal.close()

                    if( res['data']['response'] == 200 ){

                      if ( c ){
                        resolve(await this.compareTicket( res['data']['data'], d, f ))
                      }else{
                        resolve(res['data']['data']['ticket'])
                      }
                    }else{
                      Swal.fire('Error', 'Ticket no encontrado','error')
                      resolve( false )
                    }

                  }, err => {
                    const error = err.error;
                    
                    Swal.close()
                    Swal.fire('Error', error.msg,'error')
                    console.error(error.msg);

                  });

    })
  }

  async compareTicket( data, d, f ){

    let t = data['ticket']
    let u = data['users']

    let ticketU

    for( let usrs of u ){
      if( usrs['id'] == t['requester_id'] ){
        ticketU = usrs
      }
    }

    let options = {}
    if( !ticketU['email'] && !ticketU['tags'].includes('noedit') ){
      options = {'fusion': 'Fusionar', 'review': 'Corregir Ticket', 'skip': 'Continuar'}
    }else{
      options = {'review': 'Corregir Ticket', 'skip': 'Continuar'}
    }

    // console.log( t['requester_id'],d )

    if( t['requester_id'] != d['zdId'] && !ticketU['tags'].includes('noedit') ){
      const { value: option } = await Swal.fire({
        html: `
              <h3>El cliente del ticket elegido (<span class="text-primary">${ ticketU['name'] }</span>) no coincide con el cliente titular de esta reserva (<span class="text-primary">${ d['name'] }</span>)
              <br>
              <br>
              <div class="text-secondary text-truncate fst-italic">
                <p>"${ t['raw_subject'] }"</p></div>
              <br>
              <div class=''>
                <p>Revisa que el ticket sea el correcto, y verifica también que no estés duplicando clientes</p>
                <p>Si estás seguro que el ticket es correcto, selecciona "continuar"</p>
              </div>`,
        icon: 'warning',
        input: 'radio',
        inputOptions: options,
        inputValidator: (value) => {
          if (!value) {
            return 'Debes elegir una opción'
          }
        }
      })

      if ( option ) {

        switch( option ){
          case 'fusion':
            ticketU['zdId'] = ticketU['id']
            d['id'] = d['zdId']
            let newMerged = await this._merge.confirmFusion(d, ticketU, true);
            // console.log(newMerged)
            return await this.validateTicket( f ) 
          case 'skip':
            return t
          case 'review':
            return false
        }
      }
      
    }else{
      return t
    }

  }

  noTicketAlert() {

    Swal.fire({
        title: `<strong>No se ha ingresado el ticket de la reserva</strong>`,
        icon: 'warning',
        text: 'Recuerda que debes ligar el ticket en el cual el cliente te solicitó explícitamente crear la reserva. No olvides validar el ticket para poder continuar',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Omitir Ticket',
        cancelButtonText: 'Regresar',
        showDenyButton: true,
        denyButtonText: 'AskSuite',
        denyButtonColor: '#ff5622'
      }).then( async result => {
          if ( result.isDismissed ){
            return false
          }
          if ( result.isDenied ){
            console.log( 'run asksuite process' )
            let newTicket
            if( newTicket = await this.newAsksuite() ){
              this.zdTicket.get('ticket').setValue( newTicket )
              // Swal.close()
              window.open('https://oasishoteles.zendesk.com/agent/tickets/' + newTicket, '_blank');
              this.validateTicket()
              return true
            }

            Swal.fire('Error!','No fue posible crear ticket de AskSuite','error')
          }
          if (result.isConfirmed) {
            if( await this.omiteTicket() ){
              this.submitRsv()
            }else{
              return false
            }
          }
        })
  }

  omiteTicket(){

    return new Promise ( resolve => {
      if( this._init.checkSingleCredential('rsv_omitTicket') ){
        this.item.get('zdTicket').removeValidators( Validators.required )
        this.item.get('zdTicket').updateValueAndValidity()
        resolve( true )
      }else{
        Swal.fire('Denegado', 'No tienes los accesos necesarios para omitir el ticket en tu reservación', 'error')
        resolve(false)
      }
    })
  }

  newAsksuite(){

    Swal.fire({
      title: `<strong>Creando Ticket de AskSuite</strong>`,
      focusConfirm: false,
      showCancelButton: false,
    })

    Swal.showLoading()

    return new Promise ( resolve => {
      
      this._api.restfulPut( {requester: this.rsvForm.get('masterdata').value['zdUserId']}, 'Zendesk/newAskSuiteTicket' )
                .subscribe( res => {

                  let id = res['data']
                  resolve ( id )

                }, err => {

                  Swal.close()
                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                  resolve ( false )

                });
      
    })
  }

  nacionalidadCongruente(){
    return ( formGroup: UntypedFormGroup ) => {

      const isIns = formGroup.get('hasInsurance')
      const uNac = formGroup.get('nacionalidad')

      if( isIns.value ){
        if( formGroup.get( 'data.hab1.insurance') ){
          const iNac = formGroup.get( 'data.hab1.insurance.insurance.sg_mdo').value == 'nacional' ? 1 : 2
          
          if( uNac.value == iNac ){
            isIns.setErrors( null )
          }else{
            isIns.setErrors( {notCongruent: true} )
          }

        }else{
          isIns.setErrors( null )
        }
      }else{
        isIns.setErrors( null )
      }
    }
  }

  createForm( r, user ){

    // console.log('build started')

    let sum = r['habSelected']['summarySearch']
    let zd = r['formRsv']['zdUser']

    this.rsvForm =  this.fb.group({
      nacionalidad: [{ value: r['formRsv']['isNacional'] ? 1 : 2,  disabled: false }, [ Validators.required ] ],
      isUSD:        [{ value: sum['isUSD'] ? 'MXN' : 'USD',                 disabled: false }, [ Validators.required ] ],
      hasInsurance: [{ value: r['formRsv']['rsvInsurance'] || false,      disabled: false }, [Validators.required ] ],
      hasTransfer:  [{ value: r['habSelected']['hotel'] ? (r['habSelected']['hotel']['habs']['hasTransfer'] || false) : false, disabled: false }, [Validators.required ] ],
      newMaster:    [{ value: r['formRsv']['isNew'] || false,             disabled: false }, [Validators.required ] ],
      masterloc:    [{ value: (r['formRsv']['isNew'] || false) ? 'noLoc' : r['userInfo']['masterloc']['masterlocatorid'],             disabled: false }, [Validators.required ] ],
      zdTicket:     [ '', [ Validators.required ] ],
      rsvType:      [ r['habSelected']['type'], [ Validators.required ] ],
      data:         this.fb.group({})
    },{
      validators: this.nacionalidadCongruente()
    })

    if( this.rsvForm.get('masterdata') ){
      this.rsvForm.removeControl('masterdata')
    }

    if( r['formRsv']['isNew'] ){

      this.rsvForm.addControl('masterdata', this.fb.group({
          nombreCliente:  [ user.name, [ Validators.required ]],
          telCliente:     [ user.phone ],
          celCliente:     [ '' ],
          waCliente:      [ user.whatsapp ],
          correoCliente:  [ user.email, [ Validators.required ]],
          zdUserId:       [ user.zdId, [ Validators.required ]],
          esNacional:     [ user.nacionalidad == 'nacional' ? 1 : 2, [ Validators.required ]],
          languaje:       [ user.idioma_cliente, [ Validators.required ]],
          hasTransfer:    [ r['habSelected']['hotel'] ? (r['habSelected']['hotel']['habs']['hasTransfer'] ? 1 : 0) : 0, [ Validators.required ]],
          xldPol:         [ r['habSelected']['hotel'] ? r['habSelected']['extraInfo']['grupo']['xldPolicy'] : 'default' ],
          orId:           [ r['formRsv']['orId'], [ Validators.required ]],
          orLevel:        [ r['formRsv']['orLevel'], [ Validators.required ]],
          clientePaisId:  [ r['formRsv']['zdUser']['pais']['id'], [ Validators.required ]],
          clientePais:    [ r['formRsv']['zdUser']['pais']['name'], [ Validators.required ]],
        }))

    }else{
      this.rsvForm.addControl('masterdata', this.fb.group({
        orId:           [ r['formRsv']['orId'], [ Validators.required ]],
        orLevel:        [ r['formRsv']['orLevel'], [ Validators.required ]],
        clientePaisId:  [ r['formRsv']['zdUser']['pais']['id'], [ Validators.required ]],
        clientePais:    [ r['formRsv']['zdUser']['pais']['name'], [ Validators.required ]],
      }))
    }

    // console.log('emit built')
    this.rsvFormChange.emit( this.rsvForm )

    
  }

  async submitRsv(){

    if( this.rsvForm.get('zdTicket').invalid ){

      if( this.zdTicket.get('ticket').value != '' ){
        if( await !this.validateTicket( true ) ){
          return false
        }
      }else{
        this.noTicketAlert()
        return false
      }

      return false
    }

    if( this.rsvForm.valid ){
      // console.log('VALID FORM')
      Swal.fire({
        title: `<strong>Creando Reserva</strong>`,
        focusConfirm: false,
        showCancelButton: false,
      })
  
      Swal.showLoading()
      this.saveRsv()

    }else{
      console.error('INVALID FORM')
    }

    // console.log(this.rsvForm.valid, this.rsvForm)
    // console.log(this.rsvForm.value)

  }

  saveRsv(){
    
    this._api.restfulPut( this.rsvForm.value, 'Rsv/saveRsv12' )
                .subscribe( res => {

                  Swal.close()
                  Swal.fire({
                    title:  'Reserva Creada',  
                    text:   `Masterlocator: ${res['data']['masterlocator']}`, 
                    icon:   'success',
                    showCancelButton: true,
                    cancelButtonText: 'Cerrar',
                    confirmButtonText: 'Ir a Masterlocator'
                  })
                  .then( ( result ) => {
                    
                    if (result.isConfirmed) {
                      this.goToLoc( res['data']['masterlocator'] )
                    }
                    
                  })
                  // console.log(res['data'])

                  // Close Modal
                  this.done.emit( true )

                }, err => {

                  Swal.close()
                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });
  }

  goToLoc( l ){

      Swal.fire({
        title: 'Loading',
        showConfirmButton: false
      })

      Swal.showLoading()

      this._api.restfulGet( l, 'Rsv/mlExist' )
                  .subscribe( res => {
  
                    Swal.close()

                    let ver = this._init.currentUser.hcInfo['rsvVer'] ?? 1

                    if( ver == 1 ){
                      // FOR EXTERNAL ANGULAR INSTANCE
                      window.open("https://cyc-oasishoteles.com/#/rsv2/" + l)
                      return true
                    }

                    window.open("https://cyc-oasishoteles.com/#/rsv/" + l)
                    return true

  
                  }, err => {
  
                    Swal.close()
                    const error = err.error;
                    this._init.snackbar('error',error.msg, 'Cerrar')
                    console.error(err.statusText, error.msg);
  
                  });
  
  }

  digControls( c, err, n = '' ){
    // console.log('run dig')
    let arr = []
    if( c['controls'] ){
      for( let ct in c['controls'] ){
        if( c['controls'][ct].status == 'INVALID' ){
          arr.push({ctrl: ct, 'data': this.digControls( c['controls'][ct], err, n + '/' + ct )}) 
        }
      }
    }else{
      if( c.status == 'INVALID' ){
        // console.log(n, c )
        let error = {ctrl: n, 'errores': c.errors }
        arr.push( error ) 
        err.push( error )
      }
    }

    return arr
  }

  viewErrors(){

    let errors = []
    let ctrl = this.rsvForm
    let html = ""

    this.digControls( ctrl, errors )

    for( let err of errors ){
      html += `<b>${ err.ctrl }:</b><pre>${ JSON.stringify( err.errores ) }</pre><br>`
    }

    // console.log( errors )

    Swal.fire({
      title: `<strong>Errores en la información establecida</strong>`,
      icon: 'error',
      html: `<div style='max-height: 60vh; overflow: auto'><code>${ html }</code></div>`,
      focusConfirm: true,
      confirmButtonText: 'Aceptar'
    })
  }

  getZdUser( zdId ){

    return new Promise(resolve => {
        
        this._api.restfulPut( { zdId }, 'Calls/zdSearchById' )
        .subscribe( res => {
            
                let u = res['data'][0]
                let user = {
                  "zdId": u['id'],
                  "name": u['name'],
                  "email": u['email'],
                  "phone": u['phone'],
                  "whatsapp": u['user_fields']['whatsapp'],
                  "idioma_cliente": u['user_fields']['idioma_cliente'],
                  "nacionalidad": u['user_fields']['nacionalidad'],
                  "pais": {
                      "id":  u['user_fields']['id_pais'],
                      "name": u['user_fields']['pais'],
                  },
                  "user_fields": {
                      "whatsapp": u['user_fields']['whatsapp'],
                      "idioma_cliente": u['user_fields']['idioma_cliente'],
                      "nacionalidad": u['user_fields']['nacionalidad'],
                      "id_pais": u['user_fields']['id_pais'],
                      "pais": u['user_fields']['pais'],
                  }
                }
                resolve(user)

            }, err => {

                const error = err.error;
                this._init.snackbar('error', error.msg, 'Cerrar')
                console.error(err.statusText, error.msg);
                resolve(false)

            });
        
    });

  }

}
