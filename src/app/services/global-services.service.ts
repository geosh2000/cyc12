import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as Globals from '../globals';

@Injectable({
  providedIn: 'root'
})
export class GlobalServicesService {

  monitorDisplay = new Subject<boolean>();
  displayLanguage = 'idioma_en';

  avalonMap = {
    hoteles: {
      'goc': 'HT01',
      'pyr': 'HT01',
      'gop': 'HT09',
      'opb': 'HT09',
      'smart': 'HT06',
      'oh': 'HT06',
    }
  }

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
