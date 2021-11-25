import { Component, Input, OnChanges, OnInit, ViewChild, SimpleChanges, HostListener } from '@angular/core';
import { DashboardComponent } from '../dashboard/dashboard.component';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-main-view-pm',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css']
})
export class MainViewPMComponent implements OnInit, OnChanges {

  @ViewChild(DashboardComponent, {static:false}) _dash:DashboardComponent

  @Input() items = []
  @Input() master = {}
  @Input() insuranceQuote = {}
  @Input() shown = false

  sb_open = true;
  sb_style = 'side'
  fixedMain = true;
  showFiller = false;

  loading = {}

  screenHeight = 0;
  screenWidth = 0;

  responsiveWidth = 750;

  @HostListener('window:resize', ['$event'])
    onResize(event?) {
      this.responsiveEval( window.innerWidth )
    }



  constructor() { 
  }

  ngOnInit(): void {
    this.responsiveEval( window.innerWidth )
  }

  responsiveEval( sw ){

    if( sw >= this.responsiveWidth ){
      console.log('Big Screen, with fixed menu')
      this.sb_open = true
      this.sb_style = 'side'
    }else{
      console.log( sw, this.responsiveWidth )
      this.sb_open = true
      this.sb_style = 'over'
    }
  }

  
  ngOnChanges(changes: SimpleChanges) {
    console.log(changes.items)
    console.log(changes.shown)
    if( changes.items && this.shown ){
      this.loading['content'] = true
      setTimeout( () => {
        this._dash.showItem(true, this.items, this.master)
        this.loading['content'] = false

        this.responsiveEval( window.innerWidth )
      },500)
    } 

  }

  showItem( id ){

    let fullFlag = id == 'full'


    if( fullFlag ){
      this._dash.showItem(true, this.items, this.master)
      return true
    }
    
    for( let i of this.items ){
      if( i['itemLocatorId'] == id ){
        this._dash.showItem(false, [i], this.master)
        return true
      }
    }


    return false
  }

  thisYear(){
    return moment().format('YYYY')
  }

}
