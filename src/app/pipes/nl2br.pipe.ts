import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nl2br',
})
export class nl2brPipe implements PipeTransform {
  transform(value: string): string {
    if (value === null) {
      return '';
    }
    if (value === undefined) {
      return '';
    }
    return value.replace(/\n/g, '<br/>');
  }
}
