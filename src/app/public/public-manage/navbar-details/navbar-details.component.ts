import { Component, Input, OnInit } from '@angular/core';
import { GlobalServicesService } from 'src/app/services/service.index';

@Component({
  selector: 'app-navbar-details',
  templateUrl: './navbar-details.component.html',
  styleUrls: ['./navbar-details.component.css']
})
export class NavbarDetailsComponent implements OnInit {

  @Input() ml = {}

  trl = {}

  constructor( public _trl: GlobalServicesService ) { 
  }

  ngOnInit(): void {
    // this._trl.setLang('idioma_en')
  }

  setLanguage(i){
    this._trl.setLang(i)
  }
}
