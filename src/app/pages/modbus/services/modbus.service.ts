import { Injectable } from '@angular/core';
import { ModbusOptions, VariableFormat } from '@iotize/device-client.js/device/model';
import { ResultCode } from '@iotize/device-client.js/client/api/response';
import { ModbusReadAnswer, ModbusTerminalOptions } from 'src/app/helpers/modbus-helper';
import { NumberConverter } from '@iotize/device-client.js/client/impl';
import { ModbusSettingsService } from './modbus-settings.service';
import { IoTizeTap } from 'iotize-ng-com';

@Injectable({
  providedIn: 'root'
})

export class ModbusService {

  displayMode: 'HEX' | 'DEC' = 'HEX';
  isReading = false;
  private refreshTime = 1000;
  dataType: 'ASCII' | 'HEX' = 'ASCII';
  endOfLine: Array<string> = [];

  modbusOptions = new ModbusTerminalOptions({
    address: 0,
    slave: 1,
    format: VariableFormat._16_BITS,
    length: 1,
    objectType: ModbusOptions.ObjectType.DEFAULT
  });

  constructor(public deviceService: IoTizeTap,
    public settings: ModbusSettingsService) {
  }

  async sendNumber(data: number) {
    const dataArray: Uint8Array = NumberConverter.uint16Instance().encode(data);
    return this.write(dataArray, this.modbusOptions);
  }

  async read(firstTry: boolean = true, options?: ModbusOptions): Promise<ModbusReadAnswer> {
    if (options === undefined) {
      options = this.modbusOptions;
    }

    const response = await this.deviceService.tap.service.target.modbusRead(options);
    if (!response.isSuccessful()) {
      console.log('>>>>>>> ' + response.codeRet());
      if (firstTry) {
        await this.deviceService.tap.service.target.connect();
        return this.read(false, options);
      }
      throw response.codeRet();
    }

    console.log(response.body());
    return {
      dataArray: response.body(),
      firstAddress: options.address,
      format: options.format,
      objectType: options.objectType
    };
  }

  async write(values: Uint8Array, options: ModbusOptions): Promise<void> {
    const response = await this.deviceService.tap.service.target.modbusWrite({
      options: options,
      data: values
    });
    if (!response.isSuccessful()) {
      throw response.codeRet();
    }
  }
}
