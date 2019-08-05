import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'register'
})
export class RegisterPipe implements PipeTransform {

  transform(address: number, mode: string): string {
    if (mode == 'DEC')  {
      return address.toString();
    }
    if (mode == 'HEX') {
      const hexString = address.toString(16).toUpperCase();
      const size = Math.max(hexString.length ,4);
      const finalString = ('000' + hexString).slice(-size); // display at least as 16-string
      return '0x'+ finalString;
    }
  }

}
