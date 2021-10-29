import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ApiService, InitService } from 'src/app/services/service.index';
import Swal from 'sweetalert2';
import { MergeUsersComponent } from '../merge-users/merge-users.component';

export interface Pais {
  id: number;
  name: string;
  code: string;
  lon: string;
  lat: string;
}

@Component({
  selector: 'app-zd-user-edit',
  templateUrl: './zd-user-edit.component.html',
  styleUrls: ['./zd-user-edit.component.css']
})
export class ZdUserEditComponent implements OnInit {
  
  @ViewChild( MergeUsersComponent ) _merge: MergeUsersComponent

  @Input() user = {}
  @Input() nextStep = null
  @Input() prevStep = null
  @Input() thisStep = null
  @Input() backButton = false
  @Input() confirmButtonText = 'Guardar'

  // For external stepper
  @Input() optionalEdit = true

  @Output() back = new EventEmitter<any>()
  @Output() next = new EventEmitter<any>()
  @Output() saved = new EventEmitter<any>()

  userForm = this._formBuilder.group({
    zdId:           [''],
    name:           ['', Validators.required ],
    email:          ['', Validators.compose([ Validators.required, Validators.email ])],
    phone:          ['', Validators.pattern("^[\+][0-9]{1,3}[0-9]{10}$") ],
    whatsapp:       ['', Validators.pattern("^[\+][0-9\\s]{11,20}$") ],
    idioma_cliente: ['', Validators.required ],
    nacionalidad:   [{value: ''}, Validators.required ],
    id_pais:        [{value: '', disabled: true}, Validators.required ],
    pais:           ['', Validators.required ],
  });

  loading = {}
  ml = 0

  // PAISES
  paises = []
  filteredPaises: Observable<any>;
  selectedCountry: any
  

  constructor(
    private _formBuilder: FormBuilder,
    private _api: ApiService,
    private _init: InitService
  ) { 
    this.filteredPaises = this.userForm.get('pais').valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value ? value.name : ''),
      map(name => name ? this._filterP(name) : this.paises.slice())
    );
  }

  ngOnInit(): void {
    this.userForm.get('pais').valueChanges.subscribe( x => { 
     
      if( x && x['id'] ){
        
        this.userForm.get('id_pais').setValue(x['id'])
        if( x['id'] == 1 ){
          this.userForm.get('nacionalidad').setValue('nacional')
        }else{
          this.userForm.get('nacionalidad').setValue('internacional')
        }
      }else{
        this.userForm.get('id_pais').setValue('')
        this.userForm.get('nacionalidad').reset()
      }
    })

    this.getCountry()
  }

  getCountry(){

    this.loading['country'] = true

    this._api.restfulGet( '', 'Cmaya/getCountry' )
                .subscribe( res => {

                  this.loading['country'] = false;
                  this.paises = res['data']

                }, err => {
                  this.loading['country'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });

  }

  _filterP(name: string): Pais[] {
    const filterValue = name.toLowerCase()

    return this.paises.filter(option => {
      return option.name.toLowerCase().includes(filterValue)
    });
  }

  displayFn( p ): string {
    if( p ){
      return p['name'] ? p['name'].toLocaleLowerCase() : (p['value'] ? p['value'].toLocaleLowerCase() : '');
    }else{
      return ''
    }
  }

  countryClick(event: any) {
    this.selectedCountry = event.option.value;
  }
  
  checkCountry() {
   setTimeout(()=> {
    if (!this.selectedCountry || this.selectedCountry !== this.userForm.get('pais').value) {
      this.userForm.get('pais').setValue(null);
      this.selectedCountry = '';
    }
   }, 100);
  }

  validateUser( u, loc = 0, mlData = null ){

    this.ml = loc
    // console.log(u)
    this.userForm.reset()

    if( !u['user_fields'] ){
      u['user_fields'] = {
        whatsapp        : u['whatsapp'],
        idioma_cliente  : u['idioma_cliente'],
        nacionalidad    : u['nacionalidad'],
        id_pais         : u['pais']['id'],
        pais            : u['pais']['name'],
      }
    }

    this.userForm.get('zdId').setValue( u['id'])
    this.userForm.get('name').setValue( u['name'])
    this.userForm.get('email').setValue( u['email'])
    this.userForm.get('phone').setValue( u['phone'])
    this.userForm.get('whatsapp').setValue( u['user_fields']['whatsapp'])
    this.userForm.get('idioma_cliente').setValue( u['user_fields']['idioma_cliente'])
    this.userForm.get('nacionalidad').setValue( u['user_fields']['nacionalidad'])
    this.userForm.get('id_pais').setValue( u['user_fields']['id_pais'])

    if( this.userForm.get('id_pais').value != '' ){
      this.userForm.get('pais').setValue( {id: u['user_fields']['id_pais'], name: u['user_fields']['pais'] })
    }

    this.optionalEdit = this.userForm.valid

    if( this.optionalEdit ){
      if( this.nextStep != null ){
        console.log('emit next', this.nextStep)
        this.next.emit([true, this.nextStep,{ userForm: this.userForm,  mlData }])
      }else{
        console.log('emit saved', this.userForm.value)
        this.saved.emit([true,this.userForm.value])
      }
    }else{
      if( this.nextStep != null ){
        console.log('emit next, reEdit', this.thisStep)
        this.next.emit([true, this.thisStep])
      }
    }
  }

  createSaveZdUser( ml = this.ml ){

    if( this.userForm.invalid ){
      return false
    }

    this.loading['update'] = true
    
    let params = {
      zdId:   this.userForm.get('zdId').value,
      email:  this.userForm.get('email').value,
      name:   this.userForm.get('name').value,
      phone:  this.userForm.get('phone').value,
      user_fields: {
        idioma_cliente: this.userForm.get('idioma_cliente').value,
        nacionalidad:   this.userForm.get('nacionalidad').value,
        whatsapp:       this.userForm.get('whatsapp').value,
        id_pais:        this.userForm.get('id_pais').value,
        pais:           this.userForm.get('pais').value.name
      }
    }

    this._api.restfulPut( params, 'Calls/createUpdateUserC12' )
                .subscribe( async res => {

                  let mlData = null

                  this.loading['update'] = false

                  if( res['data']['response'] >= 200 && res['data']['response'] < 300 ){

                    if( ml != 0 ){
                      console.log('mlupdatuser')
                      mlData = <any>await this.updateMlUser( ml, res['data']['data']['user'] )
                      console.log( mlData )
                    }
                    
                    console.log('validateuser')
                    this.validateUser( res['data']['data']['user'], ml, mlData )
                  }else if( res['data']['response'] == 422 ){
                    console.log( res['data'] )
                    
                    this.swalFusion( res['dpl'], params, mlData )

                  }else{
                    this._init.snackbar('error', 'Ocurrio un error al guardar los datos', 'Cerrar')
                    this.back.emit([true,this.thisStep])
                  }

                }, err => {
                  this.loading['update'] = false;
                  this.back.emit([true,this.thisStep])

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });
  }

  swalFusion( usr, nu, mld ){
    Swal.fire({
      title: `<strong>Ya existe un usuario con estos datos</strong>`,
      icon: 'error',
      html:
        `<div class='container d-flex justify-content-center'><ol class="list-group">
          <li class="list-group-item d-flex justify-content-between align-items-start">
            <div class="mx-auto">
              <div class="fw-bold">Nombre</div>
              ${ usr['name'] }
            </div>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-start">
            <div class="mx-auto">
              <div class="fw-bold">Correo</div>
              ${ usr['email'] }
            </div>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-start">
            <div class="mx-auto">
              <div class="fw-bold">Teléfono</div>
              ${ usr['phone'] }
            </div>
          </li>
        </ol></div><div class="mt-3"><p>Deseas fusionar estos usuarios?</p</div>`,
      focusConfirm: true,
      showCancelButton: true,
      confirmButtonText: 'Fusionar',
      cancelButtonText: 'Cancelar'
    }).then( async (result) => {
      let user = await this._merge.confirmFusion( usr, nu )

      if( user ){
        let mlData = null

        if( this.ml != 0 ){

          Swal.fire({
            title: `<strong>Actualizando informaciòn del MasterLocator</strong>`,
            focusConfirm: false,
            showCancelButton: false,
          })
      
          Swal.showLoading()

          mlData = <any>await this.updateMlUser( this.ml, user )

          Swal.close()
          console.log( 'ml updated', mlData )
        }

        Swal.close()

        this. validateUser( user, this.ml, mlData )
      }
    })
  }

  goBack(){
    this.back.emit([true,this.prevStep])
  }

  getErrorMessage( ctrl, form: FormGroup ) {

    if ( this.loading[ctrl] ){
      return 'Cargando ' + ctrl + '...'
    }
    
    if (form.get(ctrl).hasError('required')) {
      return 'Este valor es obligatorio';
    }
    
    if (form.get(ctrl).hasError('email')) {
      return 'El valor debe tener formato de email';
    }
    
    if (form.get(ctrl).hasError('min')) {
      return 'El valor debe ser mayor o igual a ' + form.get(ctrl).errors.min.min;
    }
    
    if (form.get(ctrl).hasError('max')) {
      return 'El valor debe ser menor o igual a ' + form.get(ctrl).errors.max.max;
    }
    
    if (form.get(ctrl).hasError('pattern')) {
      return 'Formato con +###########';
    }
    
    if (form.get(ctrl).hasError('finMenorIgual')) {
      return 'La fecha final debe ser mayor al inicio';
    }
    
    if (form.get(ctrl).hasError('inicioPasado')) {
      return 'La fecha inicial no puede ser en el pasado';
    }
    
    return 'El campo tiene errores';
  }


  updateMlUser( ml, e ){

    return new Promise(resolve => {

      this.loading['saveML'] = true
      
      let updateFields = {
        nombreCliente: e['name'],
        telCliente: e['phone'],
        waCliente: e['user_fields']['whatsapp'] || null ,
        correoCliente: e['email'],
        languaje: e['user_fields']['idioma_cliente'],
        zdUserId: e['id'],
        esNacional: e['user_fields']['nacionalidad'] == null ? null : (e['user_fields']['nacionalidad'] == 'nacional' ? '1' : '2')
      }

      this._api.restfulPut( {masterlocatorid: ml, update: updateFields}, 'Rsv/updateMlUser' )
                  .subscribe( res => {

                    this.loading['saveML'] = false
                    resolve( res['data'] )


                  }, err => {

                    this.loading['saveML'] = false
                    resolve( false )

                    const error = err.error;
                    this._init.snackbar('error', error.msg, 'Cerrar')
                    console.error(err.statusText, error.msg);

                  });

    });
  }

}
