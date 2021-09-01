import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizado'
})
export class LowercasePipe implements PipeTransform {

  transform(value: string ): string {

    return value.trim().toLowerCase();

  }
}
