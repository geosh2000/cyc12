import { Component, OnInit } from '@angular/core';

import * as moment from 'moment-timezone'; 

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  year = moment().format('YYYY')

  constructor() { }

  ngOnInit(): void {
  }

}
