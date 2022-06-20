import { AfterViewInit, Component, EventEmitter, Inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { ApiService, HelpersService, InitService } from 'src/app/services/service.index';

import * as moment from 'moment-timezone';
import Swal from 'sweetalert2';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'oportunidades-create',
  templateUrl: './oportunidades-create.dialog.html',
  styleUrls: ['./oportunidades-create.dialog.css']
})
export class OportunidadesCreateDialog implements OnChanges, AfterViewInit {

  @Output() done = new EventEmitter

  @Input() rsvData = {}

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
            public _h: HelpersService,
            public dialogRef: MatDialogRef<OportunidadesCreateDialog>,
            @Inject(MAT_DIALOG_DATA) public data
          ) { 
            
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  
  ngAfterViewInit(){

  }
  
  ngOnChanges( changes: SimpleChanges ){
  }

  save(){
    this.dialogRef.close( this.data['form'] )
  }


 

}
