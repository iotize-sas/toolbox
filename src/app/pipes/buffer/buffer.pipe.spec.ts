import { BufferPipe } from './buffer.pipe';
import { NumberConverter, StringConverter } from '@iotize/device-client.js/client/impl';
import { DataDisplay, ByteOrder } from 'src/app/helpers/modbus-helper';

describe('BufferPipe', () => {
  it('create an instance', () => {
    const pipe = new BufferPipe();
    expect(pipe).toBeTruthy();
  });

  it('should throw on invalid input', () => {
    const pipe = new BufferPipe();
    let invalidBuffer = new Uint8Array([1, 2, 3]);
    expect(
      () => {
      pipe.transform(
        invalidBuffer,
        DataDisplay.INT,
        ByteOrder.B3_B2_B1_B0
        )
      }
    ).toThrow();
  });

  it('should display the same ASCII string whatever byteOrder', () => {
    const pipe = new BufferPipe();
    const testedString = 'testing pipe';
    expect(
      pipe.transform(
        StringConverter.instance().encode(testedString),
        DataDisplay.ASCII,
        ByteOrder.B0_B1_B2_B3
      )).toBe(testedString);

    expect(
      pipe.transform(
        StringConverter.instance().encode(testedString),
        DataDisplay.ASCII,
        ByteOrder.B1_B0_B3_B2
      )).toBe(testedString);

    expect(
      pipe.transform(
        StringConverter.instance().encode(testedString),
        DataDisplay.ASCII,
        ByteOrder.B2_B3_B0_B1
      )).toBe(testedString);

    expect(
      pipe.transform(
        StringConverter.instance().encode(testedString),
        DataDisplay.ASCII,
        ByteOrder.B3_B2_B1_B0
      )).toBe(testedString);
  });

});

