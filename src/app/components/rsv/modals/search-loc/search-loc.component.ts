import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
      selector: 'app-search-loc',
      templateUrl: './search-loc.component.html',
      styleUrls: ['./search-loc.component.css']
  })
  export class SearchLocDialog {

    constructor(
      public searchLocDialog: MatDialogRef<SearchLocDialog>,
      @Inject(MAT_DIALOG_DATA) public data) {

      }
  
    onNoClick(): void {
      this.searchLocDialog.close();
    }
      
  
}
  