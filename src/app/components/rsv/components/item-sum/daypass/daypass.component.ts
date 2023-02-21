import { Component, Input, OnInit } from '@angular/core';
import { HelpersService } from 'src/app/services/service.index';

@Component({
  selector: 'item-daypass',
  templateUrl: './daypass.component.html',
  styleUrls: ['./daypass.component.css']
})
export class ItemDaypassComponent implements OnInit {

  @Input() i = {}

  constructor( public _h: HelpersService ) { }

  ngOnInit(): void {
  }

  linkPrint( t ){
    if( t.length > 11 ){
      return '...' + t.substring(t.length - 8, t.length)
    }else{
      return t
    }
  }

}
