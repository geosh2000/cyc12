import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService, InitService } from 'src/app/services/service.index';

@Component({
  selector: 'app-go-to-loc',
  templateUrl: './go-to-loc.component.html',
  styleUrls: ['./go-to-loc.component.css']
})
export class GoToLocComponent implements OnInit {

  loading   = {}
  searchVal = ''

  constructor( private _api: ApiService, private _init: InitService, private router: Router) { }

  ngOnInit(): void {
  }

  goTo( v:String ){

    this.loading['searchLoc'] = true

    this._api.restfulGet( v.trim(), 'Rsv/mlExist' )
                .subscribe( res => {

                  this.loading['searchLoc'] = false;

                  this.locRoute( v )
                  
                  this.searchVal = ''
                  

                }, err => {
                  this.loading['searchLoc'] = false;

                  const error = err.error;
                  this._init.snackbar('error',error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });

    
  }

  searchConf( v:String ){


    v = v.trim()

    if( v.length >= 7 ){

      if( v.substr(6,1) == '-' ){
        this.goTo( v.substr(0,6) )
        return false
      }

      this.loading['searchLoc'] = true

      this._api.restfulGet( v.trim(), 'Rsv/searchMlByConf' )
                  .subscribe( res => {

                    this.loading['searchLoc'] = false;

                    if( !res['data'] ){
                      this._init.snackbar('error', `La confirmación ${ v.trim() }, no está ligada a ningún MasterLocator`, 'Cerrar')
                      this.searchVal = ''
                    }else{
                      this.goTo( res['data'] )
                    }
                    

                  }, err => {
                    this.loading['searchLoc'] = false;

                    const error = err.error;
                    this._init.snackbar('error',error.msg, 'Cerrar')
                    console.error(err.statusText, error.msg);

                  });

    }else{
      this.goTo( v.trim() )
    }

  }

  locRoute( v ){

    let ver = this._init.currentUser.hcInfo['rsvVer'] ?? 1

    if( ver == 1 ){
      // FOR EXTERNAL ANGULAR INSTANCE
      window.open("https://cyc-oasishoteles.com/#/rsv2/" + v)
      return true
    }

    // FOR THIS ANGULAR INSTANCE
    this.router.navigate(['/rsv/',v]);
  }

}
