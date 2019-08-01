import { Pipe, PipeTransform } from '@angular/core';

export interface EnumIndexValue {
  index: string;
  value: string;
}

@Pipe({
  name: 'enum'
})
export class EnumPipe implements PipeTransform {

  transform(enumObject: Object): Array<EnumIndexValue> {
    let keys = Object.keys(enumObject);
    keys = keys.slice(keys.length / 2);
    return keys.map((key) => {
      return {
        index: enumObject[key].toString(),
        value:  key
      };
    });
  }

}
