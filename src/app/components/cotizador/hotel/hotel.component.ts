import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'cotiza-hotel',
  templateUrl: './hotel.component.html',
  styleUrls: ['./hotel.component.css']
})
export class CotizaHotelComponent implements OnInit {

  @Output() rsv = new EventEmitter<any>()
  @Input() data: any;

  constructor() { }

  ngOnInit(): void {
    setTimeout(
      () => { this.rsv.emit('Evento emitido desde el componente de hotel' )},
      1000
    )
  }

}
