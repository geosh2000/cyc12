import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { InitService } from 'src/app/services/service.index';

@Component({
  selector: 'snack-bar',
  templateUrl: './snack-bar.component.html',
  styleUrls: ['./snack-bar.component.css']
})
export class SnackBarComponent implements OnInit {
  
  @ViewChild('template') template: TemplateRef<any>;

  msg = "Default Msg"

  constructor( private _snackBar: MatSnackBar, private _init: InitService ) {}

  ngOnInit(): void {
    this._init.snack.subscribe( s => {
        if( s['status'] ){
          this.openSnackBar( s['t'], s['title'], s['msg'] )
        }
    })
  }

  openSnackBar( type, msg, dmMsg, d = 5 ) {

    let css = {
      'success':  'success-snackbar',
      'alert':    'alert-snackbar',
      'error':    'error-snackbar',
    }

    // console.log(type, css[type])

    this._snackBar.open(msg, dmMsg, {
      duration: 5 * 1000,
      panelClass: [css[type]]
    });
  }

}




