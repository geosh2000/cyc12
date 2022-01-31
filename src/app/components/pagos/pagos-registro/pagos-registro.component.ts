import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pagos-registro',
  templateUrl: './pagos-registro.component.html',
  styleUrls: ['./pagos-registro.component.css']
})
export class PagosRegistroComponent implements OnInit {

  reload = false

  constructor() { }

  ngOnInit(): void {
  }

  reloadComponent(){
    this.reload = true

    setTimeout( () => {
      this.reload = false
    },500)
  }

}
