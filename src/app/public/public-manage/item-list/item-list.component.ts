import { Component, OnInit, Output, EventEmitter, HostListener, Input  } from '@angular/core';
import { GlobalServicesService } from 'src/app/services/service.index';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css']
})
export class ItemListComponent implements OnInit {

  @Input() sb_style
  @Input() menuOpen
  @Output() menuOpenChange = new EventEmitter<any>()
  @Output() fixedMain = new EventEmitter<any>()
  @Output() selected = new EventEmitter<any>()

  @Input() lang = 'idioma_es'
  
  items = [
    { title: 'Resumen', val: 'Resumen', icon: '' },
    { title: 'Huespedes', val: 'Huespedes', icon: '' },
    { title: 'Traslados', val: 'Traslados', icon: '' },
    { title: 'Pagos', val: 'Pagos', icon: '' },
    { title: 'Facturacion', val: 'Facturacion', icon: '' },
  ]

  constructor( public _trl: GlobalServicesService ) { 

    
  }

  ngOnInit(): void {

  }

  itemSelected( e ){
    this.menuOpenChange.emit( this.sb_style == 'over' ? false : true )
    this.selected.emit( e )
  }


}
