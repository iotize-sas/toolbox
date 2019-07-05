import { VariableFormat, ModbusOptions } from '@iotize/device-client.js/device/model';

export class ModbusReadAnswer {
  id?: number
  dataArray: Uint8Array;
  config: ModbusConfig;

  constructor(config: ModbusConfig, data: Uint8Array) {
    this.config = config.clone();
    this.dataArray = data.slice(0);
  }

  private static LAST_ID = 0;

  clone(): ModbusReadAnswer {
    const copy = new ModbusReadAnswer(
      this.config,
      this.dataArray
    );

    if (this.id) {
      copy.id = this.id;
    }
    return copy;
  }

  isEqual(modbusRead: ModbusReadAnswer,  checkId = true) {
    if (checkId) {
      if (!this.id != !modbusRead.id) {
        return false;
      }
    }

    if (this.dataArray.length != modbusRead.dataArray.length) {
      return false
    }

    for (let i = 0; i < this.dataArray.length; i++) {
      if (this.dataArray[i] != modbusRead.dataArray[i]) {
        return false;
      }
    }

    return this.config.isEqual(modbusRead.config);


  }

  static store(modbusRead: ModbusReadAnswer) {
    const copy = modbusRead.clone();

    copy.id = this.LAST_ID;
    this.LAST_ID++;
    return copy;
  }
};

export class ModbusConfig implements ModbusOptions {
  constructor(options: ModbusOptions, display: DisplayOptions, monitoringPeriod = 1000) {
    this.address = options.address;
    this.slave = options.slave;
    this.format = options.format;
    this.length = options.length;
    this.objectType = options.objectType;
    this.monitoringPeriod = monitoringPeriod;
    if (display) {
      this.displayOptions = display;
    }
  }

  address: number;
  slave: number;
  format: VariableFormat;
  length: number;
  objectType: ModbusOptions.ObjectType;
  displayOptions: DisplayOptions;
  monitoringPeriod: number;

  get objectTypeString(): string {
    return ModbusOptions.ObjectType[this.objectType];
  }
  get formatString(): string {
    return VariableFormat[this.format];
  }

  isEqual(modbusConfig): boolean {
    return this.address == modbusConfig.address
      && this.slave == modbusConfig.slave
      && this.format == modbusConfig.format
      && this.length == modbusConfig.length
      && this.objectType == modbusConfig.objectType
      && this.displayOptions.byteOrder == modbusConfig.displayOptions.byteOrder
      && this.displayOptions.displayAs == modbusConfig.displayOptions.displayAs
  }

  clone(): ModbusConfig {
    return new ModbusConfig({
      address: this.address,
      slave: this.slave,
      format: this.format,
      length: this.length,
      objectType: this.objectType
    },
      {
        byteOrder: this.displayOptions.byteOrder,
        displayAs: this.displayOptions.displayAs
      }, this.monitoringPeriod
    );
  }

}

export enum DataDisplay {
  FLOAT = 0,
  U_INT = 1,
  INT = 2,
  HEX = 3,
  ASCII = 4
}

export enum ByteOrder {
  B3_B2_B1_B0 = "B3_B2_B1_B0",
  B1_B0_B3_B2 = "B1_B0_B3_B2",
  B2_B3_B0_B1 = "B2_B3_B0_B1",
  B0_B1_B2_B3 = "B0_B1_B2_B3",

}

export type DisplayOptions = {
  displayAs: DataDisplay;
  byteOrder: ByteOrder
}