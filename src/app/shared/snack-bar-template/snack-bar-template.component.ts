import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'snack-template',
  templateUrl: './snack-bar-template.component.html',
  styleUrls: ['./snack-bar-template.component.css']
})
export class SnackBarTemplateComponent implements OnInit {

  msg = "Default Msg"
  dmMsg = "Dismiss"

  constructor() { }

  ngOnInit(): void {
  }

  setMsg( m, d ){
    this.msg = m
    this.dmMsg = d

    // console.log('wait 5 seconds')
    setTimeout( () => {
      // console.log('return')
      return true
    }, 5000)
  }

}
