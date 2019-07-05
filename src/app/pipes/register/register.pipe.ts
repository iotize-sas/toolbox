import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'register'
})
export class RegisterPipe implements PipeTransform {

  transform(address: number, mode: string): any {
    if (mode == 'DEC')  {
      return address;
    }
    if (mode == 'HEX') {
      const hexString = ('000' + address.toString(16).toUpperCase()).slice(-4); // modbus register are 16 bits
      return '0x'+ hexString;
    }
  }

}
