import { Pipe, PipeTransform } from '@angular/core';
import { FormatHelper } from '@iotize/device-client.js/core';
import { NumberConverter, FloatConverter } from '@iotize/device-client.js/client/impl';
import { DataDisplay, DisplayOptions, ByteOrder } from 'src/app/helpers/modbus-helper';
import { ByteSwapConverter } from '@iotize/device-client.js/device/extra-converter';

@Pipe({
  name: 'buffer'
})
export class BufferPipe implements PipeTransform {

  transform(buffer: Uint8Array, displayAs: DataDisplay, byteOrder: ByteOrder): any {
    let size = buffer.length;
    let reorderedBuffer: Uint8Array;

    if (size == 4) {
      const converter = new ByteSwapConverter(ByteOrder[byteOrder]);
      reorderedBuffer = converter.decode(buffer);
    } else {
      reorderedBuffer = buffer.slice(0) // copy original buffer
    }
    
    if (displayAs == DataDisplay.HEX) {
      return '0x' + FormatHelper.toHexString(reorderedBuffer);
    }
    if (displayAs == DataDisplay.ASCII) {
      return '0x' + FormatHelper.toAsciiString(reorderedBuffer);
    }


    if (displayAs == DataDisplay.INT) {
      switch (size) {
        case 1:
          return NumberConverter.int8Instance().decode(reorderedBuffer);
        case 2:
          return NumberConverter.int16Instance().decode(reorderedBuffer);
        case 4:
          return NumberConverter.int32Instance().decode(reorderedBuffer);
      }
    }
    if (displayAs == DataDisplay.U_INT) {
      switch (size) {
        case 1:
          return NumberConverter.uint8Instance().decode(reorderedBuffer);
        case 2:
          return NumberConverter.uint16Instance().decode(reorderedBuffer);
        case 4:
          return NumberConverter.uint32Instance().decode(reorderedBuffer);
      }
    }
    if (displayAs == DataDisplay.FLOAT) {
      return FloatConverter.toFloat(reorderedBuffer);
    }
  }
}
