import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'register'
})
export class RegisterPipe implements PipeTransform {

  transform(address: number, mode: string): any {
    console.log('[RegisterPipe] address', address, 'mode', mode)
    if (mode == 'DEC')  {
      return address;
    }
    if (mode == 'HEX') {
      const hexString = address.toString(16).toUpperCase();
      let returnedValue = '0x';
      if (hexString.length % 2 == 1) {
        returnedValue += '0';
      }
      returnedValue += hexString;
      return returnedValue;

    }
  }

}
