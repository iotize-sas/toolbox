import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trim'
})
export class TrimPipe implements PipeTransform {

  transform(value: string, trimChar: string = ''): string {
    if (trimChar == '') {
      return value;
    }
    const regexBegin = RegExp('^' + trimChar + '*', 'g');
    const regexEnd = RegExp(trimChar + '*$', 'g');
    const ret = value.replace(regexBegin, '').replace(regexEnd, '');
    return ret;
  }
}
