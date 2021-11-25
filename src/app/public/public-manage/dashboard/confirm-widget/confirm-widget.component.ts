import { Component, Input, OnInit } from '@angular/core';
import { GlobalServicesService } from 'src/app/services/service.index';
import * as moment from 'moment-timezone';

@Component({
  selector: 'public-confirm-widget',
  templateUrl: './confirm-widget.component.html',
  styleUrls: ['./confirm-widget.component.css']
})
export class ConfirmWidgetComponent implements OnInit {

  @Input() item = {}

  constructor( public _trl: GlobalServicesService ) { }

  ngOnInit(): void {
  }

  ft( t ){
    switch( this._trl.displayLanguage ){
      case 'idioma_en':
        return moment(t).format('YYYY-MM-DD')
        default:
        return moment(t).format('DD-MM-YYYY')
    }
  }

}
