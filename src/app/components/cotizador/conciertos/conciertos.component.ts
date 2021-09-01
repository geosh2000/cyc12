import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'cotiza-conciertos',
  templateUrl: './conciertos.component.html',
  styleUrls: ['./conciertos.component.css']
})
export class CotizaConciertosComponent implements OnInit {

  @Output() rsv = new EventEmitter<any>()
  @Input() data: any;
  
  constructor() { }

  ngOnInit(): void {
  }

}
