import { VariableFormat, ModbusOptions } from '@iotize/device-client.js/device/model';

export type ModbusReadAnswer = {
    firstAddress: number;
    dataArray: Uint8Array;
    format: VariableFormat;
    objectType: ModbusOptions.ObjectType;
  };

  export class ModbusTerminalOptions implements ModbusOptions {
    constructor(options: ModbusOptions) {
      this.address = options.address;
      this.slave = options.slave;
      this.format = options.format;
      this.length = options.length;
      this.objectType = options.objectType;
    }
    address: number;
    slave: number;
    format: VariableFormat;
    length: number;
    objectType: ModbusOptions.ObjectType;
  
    get objectTypeString(): string {
      return ModbusOptions.ObjectType[this.objectType];
    }
    get formatString(): string {
      return VariableFormat[this.format];
    }
  }