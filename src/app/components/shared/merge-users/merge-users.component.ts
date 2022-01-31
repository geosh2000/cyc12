import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/service.index';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-merge-users',
  templateUrl: './merge-users.component.html',
  styleUrls: ['./merge-users.component.css']
})
export class MergeUsersComponent implements OnInit {

  constructor(
    private _api: ApiService
  ) { }

  ngOnInit(): void {
  }

  confirmFusion( existingUsr, newUsr, confirm = false ){

    return new Promise ( resolve => {
      Swal.fire({
        title: `<strong>Estas seguro que deseas fusionar los usuarios?</strong>`,
        html: confirm ? 
        `<div class="row container">
          <div class="col-6 pe-0">
            <div class='d-flex justify-content-center'>
              <ol class="list-group">
                <li class="list-group-item d-flex justify-content-between align-items-start">
                  <div class="mx-auto">
                    <div class="fw-bold">Nombre</div>
                    ${ newUsr['name'] }
                  </div>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-start">
                  <div class="mx-auto">
                    <div class="fw-bold">Correo</div>
                    ${ newUsr['email'] }
                  </div>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-start">
                  <div class="mx-auto">
                    <div class="fw-bold">Teléfono</div>
                    ${ newUsr['phone'] }
                  </div>
                </li>
              </ol>
            </div>
          </div>
          <div class="col-6 pe-0">
            <div class='d-flex justify-content-center'>
              <ol class="list-group">
                <li class="list-group-item d-flex justify-content-between align-items-start">
                  <div class="mx-auto">
                    <div class="fw-bold">Nombre</div>
                    ${ existingUsr['name'] }
                  </div>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-start">
                  <div class="mx-auto">
                    <div class="fw-bold">Correo</div>
                    ${ existingUsr['email'] }
                  </div>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-start">
                  <div class="mx-auto">
                    <div class="fw-bold">Teléfono</div>
                    ${ existingUsr['phone'] }
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
        ` : '',
        icon: 'question',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Confirmar Fusión',
        cancelButtonText: 'Cancelar'
      }).then( async (result) => {
        if (result.isConfirmed) {
          resolve( await this.swalMerge( newUsr, existingUsr ) )
        }
      })
    })
  }

  swalMerge( nu, dpl ){

    return new Promise ( async resolve => {
      Swal.fire({
        title: `<strong>Fusionando Usuarios</strong>`,
        focusConfirm: false,
        showCancelButton: false,
        confirmButtonText: 'Confirmar Fusión',
        cancelButtonText: 'Cancelar'
      })
  
      Swal.showLoading()
  
      resolve( await this.mergeUsers( nu, dpl ) )
    })
  }

  mergeUsers( nu, dpl ){

    return new Promise ( resolve => {

        this._api.restfulPut( {actual: nu, dest: dpl }, 'Calls/mergeUsers' )
                    .subscribe( async res => {
    
                      if( res['data']['response'] == 200 ){
    
                        Swal.close()
    
                        resolve( res['user'] )
    
                      }else{
                        Swal.close()
                        Swal.fire('Error', res['data']['data']['error'], 'error')
                        resolve( false )
                      }
    
    
                    }, err => {
    
                      const error = err.error;
                      Swal.close()
                      Swal.fire('Error', error.msg, 'error')
                      console.error(err.statusText, error.msg);
                      resolve( false )
                    });
      })

  }


}
