import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService, InitService } from 'src/app/services/service.index';
import { MenuItem } from 'primeng/api';
import { OrderPipe } from 'ngx-order-pipe';
import { Subscription } from 'rxjs';


@Component({
  selector: 'main-menu',
  templateUrl: './menu.component.html',
  // template: `Hola Mundo`,
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy {

  @Output() sideBar = new EventEmitter<any>()
  @ViewChild('menuAccordion') _menuAccordion

  loading = {}
  menuData = []
  menu: MenuItem[]
  closed:Object = {}

  newLogin$: Subscription

  constructor( private _api: ApiService, private toastr: ToastrService, public _init: InitService, private _order: OrderPipe ) { }

  ngOnInit(): void {
    this.getMenu()

    this.newLogin$ = this._api.newLogin.subscribe( state => {
      if( state === true ){
        this.getMenu()
      }
    })
  }

  ngOnDestroy(): void {
      this.newLogin$.unsubscribe()
  }

  getMenu(){
    this.loading['menu'] = true

    this._api.restfulGet( '', 'Navbar/menu12')
        .subscribe( res => {

          this.loading['menu'] = false
          let menu: MenuItem[] = []
          let iconDef = 'pi pi-fw pi-link'

          for( let i in res['data'] ){

            if( res['data'][i]['permiso'] != null && !this._init.checkSingleCredential(res['data'][i]['permiso']) ){
              continue;
            }

            let item: MenuItem = {
              label: res['data'][i]['titulo'],
            }

            if( Object.keys(res['data'][i]['childs']).length > 0 ){
              item['items'] = []
              for( let x in res['data'][i]['childs'] ){

                if( res['data'][i]['childs'][x]['permiso'] != null && !this._init.checkSingleCredential(res['data'][i]['childs'][x]['permiso']) ){
                  continue;
                }

                let subitem: MenuItem = {
                  label: res['data'][i]['childs'][x]['titulo']
                }

                if( Object.keys(res['data'][i]['childs'][x]['childs']).length > 0 ){
                  subitem['items'] = []
                  for( let y in res['data'][i]['childs'][x]['childs'] ){

                    if( res['data'][i]['childs'][x]['childs'][y]['permiso'] != null && !this._init.checkSingleCredential(res['data'][i]['childs'][x]['childs'][y]['permiso']) ){
                      continue;
                    }

                    let subditem: MenuItem = {
                      label: res['data'][i]['childs'][x]['childs'][y]['titulo'],
                      icon: res['data'][i]['childs'][x]['childs'][y]['icon'] ?? iconDef,
                      routerLink: res['data'][i]['childs'][x]['childs'][y]['v2link']
                    }
                    subitem['items'].push(subditem)
                  }

                  subitem['items'] = this._order.transform( subitem['items'], 'label' )
                }else{
                  subitem['routerLink'] = res['data'][i]['childs'][x]['v2link']
                  subitem['icon'] = res['data'][i]['childs'][x]['icon'] ?? iconDef
                }
                item['items'].push( subitem )
              }

              item['items'] = this._order.transform( item['items'], 'label' )

            }else{
              item['routerLink'] = res['data'][i]['v2link']
              item['icon'] = res['data'][i]['icon'] ?? iconDef
            }

            menu.push( item )
          }

          menu = this._order.transform(menu, 'label')

          this.menu = menu

          // console.log( this.menu )



        }, err => {
          // console.log('ERROR', err)
          this.loading['menu'] = false
          let error = err.error
          this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
          console.error(err.statusText, error.msg)
        })
  }

  buildLevel( array ){
    let arr = {
      '1': [],
      '2': [],
      '0': []
    }

    for( let item of array ){
      item['titulo'] = item['titulo'].replace(/\<br\>/g, ' ')
      this.closed[item['id']] = true
      // item['titulo'] = '<small>'+item['titulo']+'</small>'
      arr[item['level']].push(item)
    }

    return arr
  }

  buildMenu( r ){
    this.menu = r
  }

}
