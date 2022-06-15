import { BreakpointObserver } from '@angular/cdk/layout';
import { StepperOrientation } from '@angular/cdk/stepper';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, InitService } from 'src/app/services/service.index';

@Component({
  selector: 'app-loc-search',
  templateUrl: './loc-search.component.html',
  styleUrls: ['./loc-search.component.css']
})
export class LocSearchComponent implements OnInit {

  @Output() selected = new EventEmitter<any>()

  loading = {}
  locsFound = []

  stepperOrientation: Observable<StepperOrientation>;
  step = 0

  firstFormGroup = this._formBuilder.group({
    inputVal: ['', Validators.required]
  });
  secondFormGroup = this._formBuilder.group({
    locSelected: ['', Validators.required]
  });

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _api: ApiService,
    private _init: InitService,
    breakpointObserver: BreakpointObserver
  ) { 
    this.stepperOrientation = breakpointObserver.observe('(min-width: 800px)')
          .pipe(
            map(({matches}) => matches ? 'horizontal' : 'vertical')
          );
  }

  ngOnInit(): void {
  }

  stepChange( e ){

    this.step = e.selectedIndex

    switch( e.selectedIndex ){
      case 1:
        if( e.previouslySelectedIndex < 1 ){
          this.searchLoc()
        }
        break
    }
  }

  searchLoc( v = this.firstFormGroup.get('inputVal').value ){
    this.loading['search'] = true
    this.locsFound = []

    this._api.restfulPut( {val: v}, 'Rsv/searchLoc' )
                .subscribe( res => {

                  this.loading['search'] = false
                  this.locsFound = res['data']

                }, err => {
                  this.loading['search'] = false;
                  this.step = 0

                  const error = err.error;
                  this._init.snackbar('error', error.msg, 'Cerrar')
                  console.error(err.statusText, error.msg);

                });
  }

  select(){
    this.selected.emit(this.secondFormGroup.get('locSelected').value)
  }

}
