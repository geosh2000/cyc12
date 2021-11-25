import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService, GlobalServicesService } from 'src/app/services/service.index';

@Component({
  selector: 'app-home-pm',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponentPM implements OnInit {

    loading = {}
    token = ''

    items = []
    master = {}
    insuranceQuote = {}

    constructor( public _api: ApiService, private activatedRoute: ActivatedRoute, 
        public _trl: GlobalServicesService ) { 

            this.activatedRoute.params.subscribe( params => {
                if ( params.token ){
                    this.token = params.token
                    this.getRsv( this.token )
                }
            });

    }

    ngOnInit(): void {
    }

    getRsv( t ){

        this.items = []
        this.master = {}

        this.loading['rsv'] = true

        this._api.restfulPut( {token: t}, 'Rsv/confGetRsv' )
            .subscribe( async res => {

                
                for( let i of res['data']['items'] ){
                    if( i['insuranceRelated'] != null ){
                        for( let iseg of res['data']['items'] ){
                            if( iseg['itemId'] == i['insuranceRelated'] ){
                                i['dataSeguros'] = iseg
                                continue
                            }
                        }
                    }
                }
                
                await this.getInsuranceQuote()
                
                this.loading['rsv'] = false;
                this.items = res['data']['items']
                this.master = res['data']['master']
                

                this._trl.setLang( res['data']['master']['idioma'] )
                
            }, err => {
                this.loading['rsv'] = false;

                const error = err.error;
                console.error(err.statusText, error.msg);
                this.items = []

            });
    }

    getInsuranceQuote(){
        return new Promise ( resolve => {

            this.insuranceQuote = {}

            this.loading['insuranceQuote'] = true

            this._api.restfulPut( '', 'Assistcard/singleQuote' )
                .subscribe( res => {

                    this.loading['insuranceQuote'] = false;

                    this.insuranceQuote = res['data']['prices']
                    resolve(true);
                    
                }, err => {
                    this.loading['insuranceQuote'] = false;
                    
                    const error = err.error;
                    console.error(err.statusText, error.msg);
                    this.items = []
                    resolve(false);

                });

        });
    }

}
