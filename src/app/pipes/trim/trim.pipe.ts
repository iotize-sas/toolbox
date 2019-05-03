import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trim'
})
export class TrimPipe implements PipeTransform {

  transform(value: string, trimChar: string = ''): string {
    const ret = value.replace(RegExp(trimChar, 'g'), '');
    console.log(ret);
    return ret;
  }
}
