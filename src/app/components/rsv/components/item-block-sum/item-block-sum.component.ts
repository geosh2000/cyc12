import { Component, Input, OnInit } from '@angular/core';
import { HelpersService } from 'src/app/services/service.index';

@Component({
  selector: 'item-sum',
  templateUrl: './item-block-sum.component.html',
  styleUrls: ['../main-frame/main-frame.component.css']
})
export class ItemBlockSumComponent implements OnInit {

  @Input() i = {}

  constructor( public _h: HelpersService ) { }

  ngOnInit(): void {
  }

}
