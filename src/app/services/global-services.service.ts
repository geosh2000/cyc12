import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as Globals from '../globals';

@Injectable({
  providedIn: 'root'
})
export class GlobalServicesService {

  monitorDisplay = new Subject<boolean>();
  displayLanguage = 'idioma_en';

  constructor() {
    this.monitorDisplay.next(false)
  }

  displayMonitor( flag ){
    this.monitorDisplay.next(flag)
  }

  getMonitorStatus(): Observable<any>{
    return this.monitorDisplay.asObservable();
  }

  setLang( l ){
    this.displayLanguage = l
    console.log('displayLang', l)
  }

  trl( t ){
    let txt = Globals.TRL[this.displayLanguage][t] ? Globals.TRL[this.displayLanguage][t] : 'N/D'

    return txt
  }



}
