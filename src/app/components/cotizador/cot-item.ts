import { Type } from '@angular/core';

export class CotItem {
  constructor(public component: Type<any>, public data: any) {}
}