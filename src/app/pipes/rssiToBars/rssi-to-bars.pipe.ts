import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rssiToBars'
})
export class RssiToBarsPipe implements PipeTransform {

  static DISPLAY_TWO_BARS = -90;
  static DISPLAY_THREE_BARS = -80;
  static DISPLAY_FOUR_BARS = -70;
  static DISPLAY_FIVE_BARS = -60;

  transform(value: number): any {
    if (value < RssiToBarsPipe.DISPLAY_TWO_BARS) {
      return 1;
    }
    if (value < RssiToBarsPipe.DISPLAY_THREE_BARS) {
      return 2;
    }
    if (value < RssiToBarsPipe.DISPLAY_FOUR_BARS) {
      return 3;
    }
    if (value < RssiToBarsPipe.DISPLAY_FIVE_BARS) {
      return 4;
    }
    return 5;
  }

}
