import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { BreakpointObserver } from '@angular/cdk/layout';
import { StepperOrientation } from '@angular/cdk/stepper';

import { ApiService, InitService } from 'src/app/services/service.index';
import { ZdUserEditComponent } from '../../shared/zd-user-edit/zd-user-edit.component';


@Component({
    selector: 'create-rsv',
    templateUrl: 'create-rsv.html',
  })
  export class RsvCreateDialog {

    @ViewChild( ZdUserEditComponent, {static: false}) _edit:ZdUserEditComponent

    stepperOrientation: Observable<StepperOrientation>;
    step = 0
    editOptional = false

    firstFormGroup = this._formBuilder.group({
        newMaster: [true, Validators.required]
    });
    secondFormGroup = this._formBuilder.group({
        user: [ '' ],
        masterloc: [ '' ]
    });
    editForm = this._formBuilder.group({
        flag:         [ false, Validators.requiredTrue ]
    });
    createRsv = this._formBuilder.group({
        // name:           ['', Validators.required ],
        isNacional:     ['', Validators.required ],
        rsvNacional:    [{value: '', disabled: true}, Validators.required ],
        rsvInsurance:   ['', Validators.required ],
        okNacionalidad: [false, Validators.requiredTrue],
        zdUser:         [ '', Validators.required ],
        orLevel:        [ '', Validators.required ],
        orId:           [ '', Validators.required ],
        isNew:          [ '', Validators.required ],
        selectedData:   [ '', Validators.required ],
        splitNames:     [ '', Validators.required ],
    });

    loading = {}
    objSelected = {}
    rsvData = {}
  
    constructor(
      public rsvDialog: MatDialogRef<RsvCreateDialog>,
      private _api: ApiService,
      private _init: InitService,
      breakpointObserver: BreakpointObserver,
      private _formBuilder: FormBuilder,
      @Inject(MAT_DIALOG_DATA) public data) {

        if( data.type == 'xfer' ){
            if( data.summarySearch.grupo == 'Cortesia' ){
                this.firstFormGroup.get('newMaster').setValue( false )
                this.firstFormGroup.get('newMaster').disable()
            }
        }

        this.stepperOrientation = breakpointObserver.observe('(min-width: 800px)')
          .pipe(
            map(({matches}) => matches ? 'horizontal' : 'vertical')
        );

        this.createRsv.get('zdUser').valueChanges.subscribe( x => { 
            if( x ){
                let nac = x['user_fields'] ? x['user_fields']['nacionalidad'] : x['nacionalidad'] 
                this.createRsv.get('isNacional').setValue( nac == 'nacional')
            }
        })

        this.createRsv.get('isNacional').valueChanges.subscribe( x => { 
            if( this.data['type'] == 'hotel' ){
                this.validateNacionalidad()
            }
        })

        this.createRsv.get('rsvNacional').valueChanges.subscribe( x => { 
            if( this.data['type'] == 'hotel' && x != '' ){
                this.validateNacionalidad()

                this.data.summarySearch.nacionalidad = (x ? 'nacional' : 'internacional')

                if( x == true ){
                    this.data.summarySearch.cobertura = 'normal'
                }

                // console.log( 'insurance changed', x, this.data )
                this.rsvData = JSON.parse(JSON.stringify({habSelected: this.data, userInfo: this.secondFormGroup.value, formRsv: this.createRsv.value}))
            }
        })
      }
  
    onNoClick(): void {
      this.rsvDialog.close();
    }

    stepChange( e ){
        // console.log( e )
    
        this.step = e.selectedIndex
    
        // switch( e.selectedIndex ){
        //   case 1:
        //     if( e.previouslySelectedIndex < 1 ){
        //       this.searchZd()
        //     }
        //     break
        //   case 2:
        //     if( e.previouslySelectedIndex == 1 ){
        //       this.validateUser()
        //     }
    
        //     if( this.usersFound.length == 0 ){
        //       this.secondFormGroup.reset()
        //     }
        //     break
        // }
    }

    async selected( e, flagValidate = true ){
        // console.log(e)
        
        this.objSelected = e
        this.editOptional = false
        this.editForm.get('flag').setValue( false )
        this.loading['selValidation'] = true
        
        let field = this.firstFormGroup.get('newMaster').value ? 'user' : 'masterloc'
        let userLoaded

        
        // this.secondFormGroup.reset()
        // this.createRsv.reset()
        this.secondFormGroup.get(field).setValue( e )

        if( this.firstFormGroup.get('newMaster').value ){
            this.createRsv.get('isNacional').setValue( e.nacionalidad == 'nacional' )
            this.createRsv.get('zdUser').setValue( e )
        }else{
            if( e.esNacional != '0' && e.esNacional != null ){
                this.createRsv.get('isNacional').setValue( e.esNacional == '1' )
            }

            if( flagValidate ){
                userLoaded = <boolean>await this.getZdUser( e.zdUserId )
            }

        }

        this.createRsv.get('isNew').setValue( this.firstFormGroup.get('newMaster').value )
        this.createRsv.get('selectedData').setValue( this.secondFormGroup.value )

        let orFlag = await this.oRewards(
            this.firstFormGroup.get('newMaster').value ? this.createRsv.get('zdUser').value['email'] : e['correoCliente'],
            this.firstFormGroup.get('newMaster').value ? this.createRsv.get('zdUser').value['name'] : e['nombreCliente']
            )
            .then( res => {
                // console.log(res)
                this.createRsv.get('orLevel').setValue(res['data']['level']['code'] == 'basic' ? 'Silver' : (res['data']['level']['code'] == 'gold' ? 'Gold' : 'Platinum') )
                this.createRsv.get('orId').setValue(res['data']['id']);
                this.createRsv.get('splitNames').setValue( res['split'] )
                return true
            })
            .catch( err => {
                return false   
            })

        if( this.data['type'] == 'hotel' ){
            this.createRsv.get('rsvInsurance').setValue( this.data['extraInfo']['grupo'] ? this.data['extraInfo']['grupo']['insuranceIncluded'] : false )
            if( this.data['extraInfo']['grupo']['insuranceIncluded'] ){
                this.createRsv.get('rsvNacional').enable()
                this.createRsv.get('rsvNacional').setValue( this.data['summarySearch']['nacionalidad'] == 'nacional' )
            }else{
                this.createRsv.get('rsvNacional').disable()
            }
            
            this.validateNacionalidad()
        }else{
            this.createRsv.get('rsvInsurance').disable()
        }

        if( flagValidate ) { 
            this._edit.validateUser(  this.createRsv.get('zdUser').value, e['masterlocatorid'] ? e.masterlocatorid : 0, e )
            this.loading['selValidation'] = false
        }else{
            this.editOptional = true
            this.editForm.get('flag').setValue( true )
            setTimeout( () => {
                this.step = 3
                this.loading['selValidation'] = false
            }, 500)
        }

        this.rsvData = JSON.parse(JSON.stringify({habSelected: this.data, userInfo: this.secondFormGroup.value, formRsv: this.createRsv.value}))
        // console.log(this.rsvData)

    }

    goToStep( e ){  

        if( e[0] == true ){
            switch( e[1] ){
                case 3:
                    this.createRsv.get('zdUser').setValue( e[2]['userForm'].value )
                    let obj = e[2]['userForm'].value
                    if( e[2]['mlData'] ){
                        obj = e[2]['mlData']
                    }else{
                        if( !this.firstFormGroup.get('newMaster').value ){
                            this._init.snackbar('Error','Hubo un error al actualizar el localizador seleccionado. El usuario sì se modifico correctamente.', 'Cerrar')
                        }
                    }

                    this.selected( obj, false )
                    break
                default:
                    this.step = e[1]
                    break
            }
        }
    }

    oRewards( m, n ){
        
        return new Promise( (resolve, reject) => {
            let oruser = {
                email:  m,
                nombre: n
            }
    
            this.loading['orw'] = true

            this._api.restfulPut( oruser, 'Loyalty/createUserFromZd' )
                    .subscribe( res => {

                    this.loading['orw'] = false;
                    resolve( res )
                    // this.searchUserFlag = false
                    
                    }, err => {
                    this.loading['orw'] = false;
                    
                    const error = err.error;
                    this._init.snackbar('error', error.msg, 'Cerrar')
                    console.error(err.statusText, error.msg);
                    reject();
                    // this.searchUserFlag = false

                    });
        });

    }

    validateNacionalidad(){
        this.createRsv.get('okNacionalidad').setValue( this.createRsv.get('rsvInsurance').value ? (this.createRsv.get('rsvNacional').value == this.createRsv.get('isNacional').value) : true )
    }

    getZdUser( zdId ){

        return new Promise(resolve => {

            this.loading['zdUser'] = true
            
            this._api.restfulPut( { zdId }, 'Calls/zdSearchById' )
            .subscribe( res => {
                
                    this.loading['zdUser'] = false;
                    this.createRsv.get('zdUser').setValue( res['data'][0] )
                    resolve(true)

                }, err => {
                    this.loading['zdUser'] = false;

                    const error = err.error;
                    this._init.snackbar('error', error.msg, 'Cerrar')
                    console.error(err.statusText, error.msg);
                    resolve(false)

                });
            
        });

    }
      
  
}
  