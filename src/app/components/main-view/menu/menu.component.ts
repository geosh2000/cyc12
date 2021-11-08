import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService, InitService } from 'src/app/services/service.index';

@Component({
  selector: 'main-menu',
  templateUrl: './menu.component.html',
  // template: `Hola Mundo`,
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  @Output() sideBar = new EventEmitter<any>()
  @ViewChild('menuAccordion') _menuAccordion

  loading = {}
  menuData = []
  menu = []
  closed:Object = {}

  constructor( private _api: ApiService, private toastr: ToastrService, public _init: InitService ) { }

  ngOnInit(): void {
    this.getMenu()
  }

  getMenu(){
    this.loading['menu'] = true

    this._api.restfulGet( '', 'Navbar/menuRAW')
        .subscribe( res => {

          this.loading['menu'] = false

          let menu =  this.buildLevel( res['data'] )
          this.buildMenu( res['data'] )

          for( let item of menu['1'] ){
            item['sub'] = []
            for( let sub of menu['2'] ){
              if( sub['parent'] == item['id'] ){
                item['sub'].push(sub)
              }
            }
          }

          for( let item of menu['0'] ){
            item['sub'] = []
            for( let sub of menu['1'] ){
              if( sub['parent'] == item['id'] ){
                item['sub'].push(sub)
              }
            }
          }

          this.menuData = menu['0']
          // console.log(menu['0'])

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
