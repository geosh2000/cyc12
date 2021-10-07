import { Component, OnInit } from '@angular/core';
import { InitService } from 'src/app/services/service.index';

@Component({
  selector: 'app-blank',
  templateUrl: './blank.component.html',
  styles: [
  ]
})
export class BlankComponent implements OnInit {

  constructor( public _init: InitService) { }

  ngOnInit(): void {
  }

}
