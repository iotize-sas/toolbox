import { RssiToBarsPipe } from './rssi-to-bars.pipe';

describe('RssiToBarsPipe', () => {
  let pipe: RssiToBarsPipe;

  beforeAll(() => {
    pipe = new RssiToBarsPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should have coherent delimiters', () => {
    expect(RssiToBarsPipe.DISPLAY_TWO_BARS).toBeLessThan(RssiToBarsPipe.DISPLAY_THREE_BARS);
    expect(RssiToBarsPipe.DISPLAY_THREE_BARS).toBeLessThan(RssiToBarsPipe.DISPLAY_FOUR_BARS);
    expect(RssiToBarsPipe.DISPLAY_FOUR_BARS).toBeLessThan(RssiToBarsPipe.DISPLAY_FIVE_BARS);
  });

  it('should return 1 if rssi is below DISPLAY_TWO_BARS', () => {
    const testedValue = RssiToBarsPipe.DISPLAY_TWO_BARS - 1;
    expect(pipe.transform(testedValue)).toBe(1);
  });

  it('should return 2 if rssi is below DISPLAY_THREE_BARS', () => {
    const testedValue = RssiToBarsPipe.DISPLAY_THREE_BARS - 1;
    expect(pipe.transform(testedValue)).toBe(2);
  });

  it('should return 3 if rssi is below DISPLAY_FOUR_BARS', () => {
    const testedValue = RssiToBarsPipe.DISPLAY_FOUR_BARS - 1;
    expect(pipe.transform(testedValue)).toBe(3);
  });

  it('should return 4 if rssi is below DISPLAY_FIVE_BARS', () => {
    const testedValue = RssiToBarsPipe.DISPLAY_FIVE_BARS - 1;
    expect(pipe.transform(testedValue)).toBe(4);
  });

  it('should return 5 if rssi is equal or over DISPLAY_FIVE_BARS', () => {
    const testedValue = RssiToBarsPipe.DISPLAY_FIVE_BARS;
    expect(pipe.transform(testedValue)).toBe(5);
  });
});
