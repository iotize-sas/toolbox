import { Injectable } from '@angular/core';
import { ModbusOptions, VariableFormat } from '@iotize/device-client.js/device/model';
import { ModbusReadAnswer, ModbusTerminalOptions } from 'src/app/helpers/modbus-helper';
import { NumberConverter } from '@iotize/device-client.js/client/impl';
import { IoTizeTap } from '@iotize/ng-com-services';
import { SettingsService } from 'src/app/services/settings.service';
import { interval, from, Observable, Subject } from 'rxjs';
import { map, timeInterval } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class ModbusService {

  displayMode: 'HEX' | 'DEC' = 'HEX';
  registerMode: 'HEX' | 'DEC' = 'HEX';
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
    public settings: SettingsService) {
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

  monitoring(options?: ModbusOptions, period = 1000): Observable<Monitor<ModbusReadAnswer>> {
    const timer = interval(period);
    return new Observable<Monitor<ModbusReadAnswer>>(observer => {
      const subscription = timer.subscribe(async () => {
        try {
          const modbusAnswer = await this.read(true, options);
          observer.next({
            type:'next',
            answer: modbusAnswer
          });
        } catch (error) {
          observer.next({
            type: 'error',
            answer: error
          });
        }
      });
      return {
        unsubscribe: () => {
          subscription.unsubscribe();
          console.log('unsubscribed from the monitoring task');
        }
      }
    })
  }
}

export type Monitor<T> = {
  type: 'next' | 'error',
  answer : T | any
}