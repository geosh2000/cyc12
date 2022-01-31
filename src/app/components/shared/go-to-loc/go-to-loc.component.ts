import { Component, OnInit } from '@angular/core';
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

  constructor( private _api: ApiService, private _init: InitService) { }

  ngOnInit(): void {
  }

  goTo( v:String ){

    this.loading['searchLoc'] = true

    this._api.restfulGet( v.trim(), 'Rsv/mlExist' )
                .subscribe( res => {

                  this.loading['searchLoc'] = false;

                  // FOR EXTERNAL ANGULAR INSTANCE
                  window.open("https://cyc-oasishoteles.com/#/rsv2/" + v)

                  // FOR THIS ANGULAR INSTANCE
                  // this.router.navigate(['/rsv2',v]);
                  
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

}
