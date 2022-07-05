import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiService, ComercialService, HelpersService, InitService } from 'src/app/services/service.index';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { Moment } from 'moment';

import * as moment from 'moment-timezone';
import 'moment/locale/es-mx';

import Swal from 'sweetalert2';
import { OportunidadesCreateDialog } from './oportunidades-create/oportunidades-create.dialog';
import { resolve } from 'dns';


export const MY_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD-MM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

declare var jQuery: any;

@Component({
  selector: 'oportunidades-search',
  templateUrl: './oportunidades-search.component.html',
  styleUrls: ['./oportunidades-search.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class OportunidadesSearchComponent implements OnInit {

  @Input() visible: boolean
  @Output() opReady = new EventEmitter

  opportunitySearch: UntypedFormGroup
  opportunityForm: UntypedFormGroup

  opCtrlProps = {
    "TipoRegistroNombre":    {
          get:               { shown: true, bodas: true,  grupos: true,     readonly: true, },
          create:            { active: true, shown: false, bodas: true,  grupos: true,     map: 'TipoDeOportunidad',  default: ''  },
          type: 'select',     
          displayText:'Tipo de Registro',             
          listName: 'sf_tipoReg' 
        },
    "TipoRegistroId":        {
          get:               { shown: false,  bodas: true,  grupos: true,    readonly: false, },
          create:            { shown: false,  bodas: true,  grupos: true,     map: 'TipoRegistroId',  default: ''  },
          type: 'text',       
          displayText:'TipoRegistroId',               
        },
    "TipoDeCuenta":          {
          get:               { shown: true, bodas: true,  grupos: true,     readonly: true, },
          create:            { active: true, shown: false, bodas: true,  grupos: true,     map: 'TipoDeCuenta',  default: 'Grupos'  },
          type: 'text',       
          displayText:'Tipo de Cuenta',               
        },
    "SocioComercialNombre":  {
          get:               { shown: true, bodas: true,  grupos: true,     readonly: true, },
          create:            { shown: false,  bodas: true,  grupos: true,     map: 'SocioComercialNombre',  default: ''  },
          type: 'text',       
          displayText:'Nombre Socio Comercial',       
        },
    "SocioComercialId":      {
          get:               { shown: false,  bodas: true,  grupos: true,    readonly: false, },
          create:            { active: true, shown: false, bodas: true,  grupos: true,     map: 'SocioComercialId',  default: ''  },
          type: 'text',       
          displayText:'SocioComercialId',             
        },
    "PropietarioNombre":     {
          get:               { shown: true, bodas: true,  grupos: true,     readonly: true, },
          create:            { shown: false,  bodas: true,  grupos: true,     map: 'PropietarioNombre', default: ''  },
          type: 'text',       
          displayText:'Coordinador',                  
        },
    "Propietario":           {
          get:               { shown: false,  bodas: true,  grupos: true,    readonly: false, },
          create:            { shown: false,  bodas: true,  grupos: true,     map: 'Propietario', default: ''  },
          type: 'text',       
          displayText:'Propietario',                  
        },
    "Mercado":               {
          get:               { shown: true, bodas: true,  grupos: true,     readonly: false, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'Mercado', default: ''  },
          type: 'select',     
          displayText:'Mercado',                      
          listName: 'sf_mercado' 
        },
    "HotelEvento":           {
          get:               { shown: true, bodas: true,  grupos: true,     readonly: false, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'HotelEvento', default: ''  },
          type: 'select',     
          displayText:'Hotel del evento',             
          listName: 'sf_hoteles' 
        },
    "OrigenProspecto":       {
          get:               { shown: false,  bodas: true,  grupos: true,    readonly: false, },
          create:            { active: true, shown: false,  bodas: true,  grupos: true,    map: 'OrigenProspecto', default: 'Cotizador'  },
          type: 'text',       
          displayText:'Origen del Prospecto',         
        },
    "Observaciones":         {
          get:               { shown: true, bodas: true,  grupos: true,     readonly: false, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'Observaciones', default: ''  },
          type: 'text',       
          displayText:'Observaciones',                
        },
    "NoPax":                 {
          get:               { shown: true, bodas: true,  grupos: true,     readonly: false, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'NoPax', default: ''  },
          type: 'number',     
          displayText:'No. Pax',                      
        },
    "Nombre":                {
          get:               { shown: true, bodas: true,  grupos: true,     readonly: false, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'Nombre',  default: ''  },
          type: 'text',       
          displayText:'Nombre',                       
        },
    "idOportunidad":         {
          get:               { shown: false,  bodas: true,  grupos: true,    readonly: false, },
          create:            { shown: false,  bodas: true,  grupos: true,     map: 'idOportunidad', default: ''  },
          type: 'text',       
          displayText:'idOportunidad',                
        },
    "Idioma":                {
          get:               { shown: true, bodas: true,  grupos: true,     readonly: false, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'Idioma',  default: ''  },
          type: 'select',     
          displayText:'Idioma',                       
          listName: 'sf_idioma' 
        },
    "FechaCierre":           {
          get:               { shown: false,  bodas: true,  grupos: true,    readonly: false, },
          create:            { active: true, shown: true,   bodas: true,  grupos: true,    map: 'FechaCierre', default: ''  },
          type: 'date',       
          displayText:'Fecha de Cierre',              
        },
    "Etapa":                 {
          get:               { shown: true, bodas: true,  grupos: true,     readonly: true, },
          create:            { active: true, shown: false, bodas: true,  grupos: true,     map: 'Etapa', default: 'Inicio'  },
          type: 'text',       
          displayText:'Etapa',                        
        },
    "Divisa":                {
          get:               { shown: true, bodas: true,  grupos: true,     readonly: false, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'Divisa',  default: ''  },
          type: 'select',     
          displayText:'Divisa',                       
          listName: 'sf_currency' 
        },
    "CuentaId":              {
          get:               { shown: false,  bodas: true,  grupos: true,    readonly: true, },
          create:            { shown: false,  bodas: true,  grupos: true,     map: 'CuentaId',  default: ''  },
          type: 'text',       
          displayText:'CuentaId',                     
        },
    "contactId":             {
          get:               { shown: false,  bodas: true,  grupos: true,    readonly: true, },
          create:            { active: false, shown: false, bodas: true,  grupos: true,     map: 'contactoId', default: ''  },
          type: 'text',       
          email: true,
          displayText:'Correo Contacto (id)',                    
        },
    "accountId":             {
          get:               { shown: false,  bodas: true,  grupos: true,    readonly: true, },
          create:            { shown: false,  bodas: true,  grupos: true,     map: 'accountId', default: ''  },
          type: 'text',       
          displayText:'accountId',                    
        },
    "FechaBoda":             {
          get:               { shown: true, bodas: true,  grupos: false,     readonly: false, },
          create:            { active: true, shown: true, bodas: true,  grupos: false,     map: 'FechaBoda', default: ''  },
          type: 'date',       
          displayText:'Fecha de Boda',                
        },
    "FechaInicioEstancia":   {
          get:               { shown: true, bodas: false,  grupos: true,     readonly: false, },
          create:            { active: true, shown: true, bodas: false,  grupos: true,     map: 'FechaInicioEstancia', default: ''  },
          type: 'date',       
          displayText:'Fecha de Inicio',              
        },
    "FechaFinEstancia":      {
          get:               { shown: true, bodas: false,  grupos: true,     readonly: false, },
          create:            { active: true, shown: true, bodas: false,  grupos: true,     map: 'FechaFinEstancia',  default: ''  },
          type: 'date',       
          displayText:'Fecha de Fin',                 
        },
    "NombreAccount":         {
          get:               { shown: true, bodas: true,  grupos: true,     readonly: false, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'NombreAccount', default: ''  },
          type: 'text',       
          displayText:'Nombre de Cuenta',             
        },
    "TelefonoAccount":       {
          get:               { shown: false,  bodas: true,  grupos: true,    readonly: true, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'TelefonoAccount', default: ''  },
          type: 'text',       
          displayText:'Telefono de Cuenta',           
        },
    "EmailAccount":          {
          get:               { shown: false,  bodas: true,  grupos: true,    readonly: true, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'EmailAccount',  default: ''  },
          type: 'text',       
          email: true,
          displayText:'Email de Cuenta',              
        },
    "NacionalidadAccount":   {
          get:               { shown: false,  bodas: true,  grupos: true,    readonly: true, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'NacionalidadAccount', default: ''  },
          type: 'select',     
          displayText:'Nacionalidad de Cuenta',       
          listName: 'sf_nacionalidad' 
        },
    "CalleAccount":          {
          get:               { shown: false,  bodas: true,  grupos: true,    readonly: true, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'CalleAccount',  default: ''  },
          type: 'text',       
          displayText:'Calle de Cuenta',              
        },
    "CodigoPostalAccount":   {
          get:               { shown: false,  bodas: true,  grupos: true,    readonly: true, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'CodigoPostalAccount', default: ''  },
          type: 'text',       
          displayText:'Codigo Postal de Cuenta',      
        },
    "CiudadAccount":         {
          get:               { shown: false,  bodas: true,  grupos: true,    readonly: true, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'CiudadAccount', default: ''  },
          type: 'text',       
          displayText:'Ciudad de Cuenta',             
        },
    "EstadoAccount":         {
          get:               { shown: false,  bodas: true,  grupos: true,    readonly: true, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'EstadoAccount', default: ''  },
          type: 'text',       
          displayText:'Estado de Cuenta',             
        },
    "paisAccount":           {
          get:               { shown: false,  bodas: true,  grupos: true,    readonly: true, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'paisAccount', default: ''  },
          type: 'select',     
          displayText:'Pais de Cuenta',               
          listName: 'sf_pais' 
        },
    "NombreContact":         {
          get:               { shown: true, bodas: true,  grupos: true,     readonly: true, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'NombreContact', default: ''  },
          type: 'text',       
          displayText:'Nombre del Contacto',          
        },
    "ApellidosContact":      {
          get:               { shown: true, bodas: true,  grupos: true,     readonly: true, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'ApellidosContact',  default: ''  },
          type: 'text',       
          displayText:'Apellidos del Contacto',       
        },
    "TelefonoContact":       {
          get:               { shown: true, bodas: true,  grupos: true,     readonly: true, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'TelefonoContact', default: ''  },
          type: 'text',       
          displayText:'Telefono del Contacto',        
        },
    "EmailContact":          {
          get:               { shown: true, bodas: true,  grupos: true,     readonly: true, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'EmailContact',  default: ''  },
          type: 'text',       
          email: true,
          displayText:'Email del Contacto',           
        },
    "NacionalidadContact":   {
          get:               { shown: true, bodas: true,  grupos: true,     readonly: true, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'NacionalidadContact', default: ''  },
          type: 'select',     
          displayText:'Nacionalidad del Contacto',    
          listName: 'sf_pais' 
        },
    "cargoContact":          {
          get:               { shown: true, bodas: true,  grupos: true,     readonly: true, },
          create:            { active: true, shown: true, bodas: true,  grupos: true,     map: 'cargoContact',  default: ''  },
          type: 'text',       
          displayText:'Cargo del Contacto',           
        },
  }

  opportunities = []
  collections = {}
  loading = {}

  constructor(
    public _api: ApiService, 
          public _init: InitService, 
          public _com: ComercialService,
          public _h: HelpersService,
          public dialog: MatDialog,
          private fb: UntypedFormBuilder,
  ) { 
    this.opportunityForm =  this.fb.group({
      TipoRegistroNombre    : [{ value: '',     disabled: false}, [ Validators.required ], [{ metadata: true }] ]
    })

    this.createOpForm()
  }

  ngOnInit(): void {
    this.getCollections()
  }

  getCollections(){

    this.collections = {}
    this.loading['collections'] = true;

    this._api.restfulGet( '', 'Lists/sfCollections' )
                .subscribe( res => {

                  this.loading['collections'] = false;

                  this.collections = res['data']
                  this.collections['sf_tipoReg'] = [ {label: 'Boda', value: 'Bodas'}, {label: 'Grupo', value: 'Grupos'} ]


                }, err => {
                  this.loading['collections'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });
  }

  createOpForm(){
    this.opportunitySearch =  this.fb.group({
      selDate:      [{ value: '',  disabled: false }, [ Validators.required ] ],
      fechaInicio:  [{ value: '',  disabled: false }, [ Validators.required ] ],
      fechaFin:     [{ value: '',   disabled: false }, [ Validators.required ] ],
      contactoId:   [{ value: '',  disabled: false }, [ Validators.required ] ],
      tipo:         [{ value: '',  disabled: false }, [ Validators.required ] ]
    })

    // Set endDate
    this.opportunitySearch.controls['selDate'].valueChanges.subscribe( x => { 
      let sel: Moment = moment(x.format('YYYY-MM-DD') )
      this.opportunitySearch.get('fechaInicio').setValue( sel.subtract(30, 'days').format('YYYY/MM/DD') )
      this.opportunitySearch.get('fechaFin').setValue( sel.add(60, 'days').format('YYYY/MM/DD') )
    })
  }

  searchOp(){

    this.opportunities = []
    this.loading['searchop'] = true;

    this._api.restfulPost( this.opportunitySearch.value, 'Sf/searchOportunity' )
                .subscribe( res => {

                  this.loading['searchop'] = false;

                  if( res['data'].length == 0 ){

                    Swal.fire({
                      title: '<strong>Sin Resultados</strong>',
                      icon: 'warning',
                      text: 'No se encontraron oportunidades con estos datos',
                      showCloseButton: false,
                      showCancelButton: true,
                      showConfirmButton: true,
                      focusConfirm: true,
                      confirmButtonText: 'Crear Oportunidad',
                      cancelButtonText: 'Cerrar',
                    }).then((result) => {
                      
                      if (result.isConfirmed) {
                        this.createOp()
                      } else {
                        Swal.close()
                      }
                    })

                    return
                  }

                  this.opportunities = res['data']
                  this.listOppotunities( res['data'] )


                }, err => {
                  this.loading['searchop'] = false;

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });
  }

  updateOp( create = false, form = this.opportunityForm ){

    Swal.fire({
      title: `Guardando ${ create ? 'oportunidad' : 'cambios'} ...`,
      showCancelButton: false,
      showConfirmButton: false,
    })
    Swal.showLoading()

    this.opportunities = []
    this.loading['updateOp'] = true;

    let params = {}

    for( let f in this.opCtrlProps ){
      let c = this.opCtrlProps[f]

      if( c['create']['active'] && c['create'][ this.opportunityForm.get('TipoRegistroNombre').value.toLowerCase() ]){
        params[c['create']['map']] = this.opportunityForm.get(f).value

        if( c['type'] == 'date' ){
          if( this.opportunityForm.get(f).value != null ){
            params[c['create']['map']] = params[c['create']['map']].format('YYYY/MM/DD')
          }else{
            params[c['create']['map']] = null
          }
        }
      }
    }

    if( !create ){
      params['idOportunidad'] = this.opportunityForm.get('idOportunidad').value
    }

    this._api.restfulPost( { create, params }, 'Sf/updateOportunity' )
                .subscribe( res => {

                  this.loading['updateOp'] = false;

                  console.log( res )

                  if( res['data'][ create ? 'opportunityId' : 'updatedOpportunity'] ){
                    Swal.fire('Guardado', res['msg'], 'success')
                    this._init.snackbar('success', res['msg'], 'Cerrar')
                  }else{
                    Swal.fire('Error', 'No se actualizó el registro', 'error')
                    if( create ){
                      this.openCreateDialog( form )
                    }
                  }


                }, err => {
                  this.loading['updateOp'] = false;

                  const error = err.error;
                  Swal.fire('Error', error.msg, 'error')
                  if( create ){
                    this.openCreateDialog( form )
                  }
                  console.error(err.statusText, error.msg);

                });
  }


  async askForType(){

    return new Promise( async ( val ) => {
      const { value: result } =  await Swal.fire({
        title: 'Elige el tipo de oportunidad',
        input: 'select',
        inputOptions: {
          Bodas: 'Boda',
          Grupos: 'Grupo'
        },
        inputPlaceholder: 'Elige un tipo',
        showCancelButton: true,
        // inputValidator: (value) => {
        //   return new Promise((resolve) => {
        //     if (value != '') {
        //       resolve( value )
        //     } else {
        //       resolve('Debes elegir un tipo de oportunidad')
        //     }
        //   })
        // }
      })
    
      if ( result ) {
        val( result )
      }else{
        val ( false )
      }
    })
    
  }


  async createOpEditForm( o = {}, t = 'get' ){

    return new Promise( async ( resolve ) => {

     if( (o['TipoRegistroNombre'] ?? null) == null ){
       o['TipoRegistroNombre'] = await this.askForType()

        if( !o['TipoRegistroNombre'] ){
          this.dialog.closeAll()
        }
      }

      this.opportunityForm =  this.fb.group({})

      for( let ctrl in this.opCtrlProps ){

        let c = this.opCtrlProps[ctrl]

        let val = c[t]['required'] ? [ Validators.required ] : []

        if( c['email'] ){
          val.push( Validators.email )
        }

        if( c[t][o['TipoRegistroNombre'].toLowerCase()] ){
          if( t == 'get' || t == 'create' && c[t]['active'] ){
            if( c['type'] == 'date' ){
              this.opportunityForm.addControl( ctrl, new UntypedFormControl({ value: o[ctrl] ? moment(o[ctrl], 'YYYY-M-DD').tz('America/Bogota') : null,     disabled: t == 'get' ? c['get']['readonly'] : !c['create']['shown'] }, val ))
            }else{
              this.opportunityForm.addControl( ctrl, new UntypedFormControl({ value: t == 'get' ? (o[ctrl] ?? null) : (ctrl == 'TipoRegistroNombre'? o['TipoRegistroNombre'] : c['create']['default']),     disabled: t == 'get' ? c['get']['readonly'] : (!c['create']['shown'])  }, val ))
            }
          }
        }

      }

      this.opReady.emit( true )

      resolve( true )
    })
    
  }

  async createOp( o = {} ) {

    await this.createOpEditForm( o, 'create' )

    console.log( this.opportunityForm.value )

    this.openCreateDialog()
    
  }

  openCreateDialog( form = this.opportunityForm ){
    const dialogRef = this.dialog.open(OportunidadesCreateDialog, {
      maxWidth: '80vw',
      data: { form: form, params: this.opCtrlProps, collections: this.collections }
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed', result);

      if( typeof result == 'undefined' ){
        // this.extraInfo['grupo']['insuranceIncluded'] = true;
      }else{
        this.updateOp( true )
      }
    });
  }

  async listOppotunities( l ){

    let ops = []
    let i = 1

    // l.push( JSON.parse(JSON.stringify(l[0])) )

    for( let op of l ){
      // if( i == 2 ){
      //   op['Nombre'] = 'Jorge Sanchez'
      // }
      ops.push( i + ': "' + op.Nombre + '" - Inicio: ' + moment((op.FechaBoda ? op.FechaBoda : op.FechaInicioEstancia)).format('DD MMM YYYY') )
      i++
    }
   
    const { value: opportunity } = await Swal.fire({
      title: 'Elige una oportunidad',
      input: 'radio',
      customClass: {
        input: 'swal-radio'
      },
      inputOptions: ops,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          // return 'Debes elegir una oportunidad para continuar'
          
          this.noOpInput( l )

          return ''
        }
      }
    })

    if (opportunity) {

      this.createOpEditForm( l[ opportunity ] )
      Swal.close()
    }else{
      this.noOpInput( l )
    }
  }

  noOpInput( l ){
    Swal.fire({
      title: '<strong>Crear Oportunidad?</strong>',
      icon: 'warning',
      text: 'No elegiste ninguna oportunidad... Deseas crear una nueva?',
      showCloseButton: false,
      showCancelButton: true,
      showDenyButton: true,
      showConfirmButton: true,
      focusConfirm: true,
      cancelButtonText: 'Regresar a listado',
      denyButtonText: 'Cerrar',
      confirmButtonText: 'Crear Oportunidad',
    }).then((result) => {
      
      if (result.isConfirmed) {
        this.createOp()
      }
      
      if (result.isDenied) {
        Swal.close()
      }
      
      if (result.isDismissed) {
        this.listOppotunities( l )
      }

    })
  }

  

}
