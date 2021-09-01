import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'cycOasis';

  sb_open = false;

  constructor() { }

  ngOnInit(): void {
  }

  menuChange(){
    // console.log('Menu clicked', !this.sb_open)
    this.sb_open = !this.sb_open
  }
}

