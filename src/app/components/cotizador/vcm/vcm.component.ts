import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'cotiza-vcm',
  templateUrl: './vcm.component.html',
  styleUrls: ['./vcm.component.css']
})
export class CotizaVcmComponent implements OnInit {

  @Output() rsv = new EventEmitter<any>()
  @Input() data: any;

  constructor() { }

  ngOnInit(): void {
  }

}
