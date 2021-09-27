import { Component, OnInit } from '@angular/core';
import { InitService } from 'src/app/services/service.index';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css']
})
export class MainViewComponent implements OnInit {


  constructor( public _init: InitService) { }

  ngOnInit(): void {
  }

}
