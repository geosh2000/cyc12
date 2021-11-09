import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-item-rsv',
  templateUrl: './item-rsv.component.html',
  styleUrls: ['./item-rsv.component.css']
})
export class ItemRsvComponent implements OnInit {

  @Input() ml = {}
  @Input() items = []

  constructor() { }

  ngOnInit(): void {
  }

}
