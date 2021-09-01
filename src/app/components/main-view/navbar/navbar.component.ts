import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'main-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  token = true

  @Output() menuChange = new EventEmitter<any>()

  constructor() { }

  ngOnInit(): void {
  }

  menuClick(){
    this.menuChange.emit( true )
  }

}
