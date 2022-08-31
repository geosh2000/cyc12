import { AfterViewInit, Component, EventEmitter, Inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { ApiService, HelpersService, InitService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';
import Swal from 'sweetalert2';

import html2canvas from 'html2canvas';

@Component({
  selector: 'cart-checkout',
  templateUrl: './cart-checkout.dialog.html',
  styleUrls: ['./cart-checkout.dialog.css']
})
export class CartCheckoutDialog implements OnChanges, AfterViewInit {

  @Output() done = new EventEmitter

  @Input() rsvData = {}
  @Input() dates = []

  rsvForm = this.fb.group({})

  levelSelected = {
    selected: 1,
    data: {}
  }

  levelsData = {}

  levelNames = {
    'publica': 1,
    'silver': 2,
    'gold': 3,
    'platinum': 4,
  }

  namePattern = "^[A-Za-záéíóúÁÉÍÓÚ]+([\\s]{1}[A-Za-záéíóúÁÉÍÓÚ]+)*$"

  

  constructor(
            private fb: UntypedFormBuilder,
            private _api: ApiService,
            public _init: InitService,
            public _h: HelpersService
          ) { 
            
  }


  
  ngAfterViewInit(){

  }
  
  ngOnChanges( changes: SimpleChanges ){
  }

  save(){
    // this.dialogRef.close( this.data['form'] )
  }

  lastNight( e ){
    return moment( e ).add(1,'days').format('YYYY-MM-DD')
  }

  createImg( el ){
    console.log( el )

    let params = {
      backgroundColor: '#ffffff',	
    }

    html2canvas( el, params ).then((canvas) => {
      const imgData = canvas.toDataURL("image/jpeg")
 
      // console.log(imgData, canvas)

      const source = imgData;
      const link = document.createElement("a");
      link.href = source;
      link.download = `Table.jpeg`
      link.click();
    })
  }

  submit(){
    // this.dialogRef.close( true )
  }


 

}
