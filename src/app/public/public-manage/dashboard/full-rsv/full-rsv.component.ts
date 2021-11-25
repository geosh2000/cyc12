import { Component, Input, OnInit } from '@angular/core';
import { GlobalServicesService } from 'src/app/services/service.index';

@Component({
  selector: 'app-full-rsv',
  templateUrl: './full-rsv.component.html',
  styleUrls: ['./full-rsv.component.css']
})
export class FullRsvComponent implements OnInit {

  @Input() ml = {}
  @Input() insuranceQuote = {}
  @Input() items = []

  constructor( public _trl: GlobalServicesService ) { }

  ngOnInit(): void {

  }



}
