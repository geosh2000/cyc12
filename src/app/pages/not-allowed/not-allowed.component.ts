import { Component, OnInit } from '@angular/core';
import * as moment from 'moment-timezone'; 

@Component({
  selector: 'app-not-allowed',
  templateUrl: './not-allowed.component.html',
  styleUrls: ['./not-allowed.component.css']
})
export class NotAllowedComponent {

  year = moment().format('YYYY')

  constructor() { }

  ngOnInit(): void {
  }

}
