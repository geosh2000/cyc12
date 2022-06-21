import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ComercialService {

  public quoteType:BehaviorSubject<string> = new BehaviorSubject<string>('');
  public lastQuoteType = '';

  constructor( private _router: Router ) { 
    this._router.events
        .pipe(filter(e => e instanceof NavigationStart))
        .subscribe((e: NavigationStart) => {
          const navigation  = this._router.getCurrentNavigation();
          this.lastQuoteType = navigation.extras.state ? navigation.extras.state.type : '' ;
          this.quoteType.next( navigation.extras.state ? navigation.extras.state.type : '' );
      });
  }
}