import { Component, HostListener, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  @Input() parentLoading = false
  @Input() menuStatus = true
  @Input() insuranceQuote = {}

  items = []
  ml = {}
  fullFlag = true

  constructor() { }

  ngOnChanges( changes: SimpleChanges ){
  }

  ngOnInit(): void {
  }

  showItem( f, i = [], ml ){

    this.items = i
    this.ml = ml
    this.fullFlag = f

    window.scroll(0,0);

  }

}
