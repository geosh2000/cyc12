// tslint:disable: directive-selector
import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[repHost]',
})
export class ReportingDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

