import { Injectable } from '@angular/core';
import { ModbusOptions, VariableFormat } from '@iotize/device-client.js/device/model';
import { ModbusReadAnswer, ModbusConfig, DataDisplay, DisplayOptions, ByteOrder } from 'src/app/helpers/modbus-helper';
import { NumberConverter } from '@iotize/device-client.js/client/impl';
import { SettingsService } from 'src/app/services/settings.service';
import { interval, Observable, Subscription } from 'rxjs';
import { ResultCodeTranslation } from '@iotize/device-client.js/client/api/response';
import { TapService } from 'src/app/services/tap.service';

@Injectable({
  providedIn: 'root'
})

export class ModbusService {

  displayOptions: DisplayOptions = {
    displayAs: DataDisplay.HEX,
    byteOrder: ByteOrder.B3_B2_B1_B0
  }
  registerMode: 'HEX' | 'DEC' = 'HEX';
  isReading = false;
  private refreshTime = 1000;
  dataType: 'ASCII' | 'HEX' = 'ASCII';
  endOfLine: Array<string> = [];

  displayedModbusOptions: ModbusConfig;

  constructor(public tapService: TapService,
    public settings: SettingsService) {
      this.savedModbusValues = new Map();
      this._monitoredIds = new Map();
      this.displayedModbusOptions = new ModbusConfig({
        address: 0,
        slave: 1,
        format: VariableFormat._16_BITS,
        length: 1,
        objectType: ModbusOptions.ObjectType.DEFAULT
      }, this.displayOptions);
      this.saveOptions();
      // this.mockValues();
    }
    
  async sendNumber(data: number) {
    const dataArray: Uint8Array = NumberConverter.uint16Instance().encode(data);
    return this.write(dataArray, this.savedModbusOptions);
  }

  async read(firstTry: boolean = true, config?: ModbusConfig): Promise<Uint8Array> {
    if (config === undefined) {
      config = this._savedModbusConfig;
    }

    const response = await this.tapService.tap.service.target.modbusRead(config);
    if (!response.isSuccessful()) {
      console.log('>>>>>>> ' + response.codeRet());
      if (firstTry) {
        await this.tapService.tap.service.target.connect();
        return this.read(false, config);
      }
      throw response.codeRet();
    }

    console.log(response.body());
    return response.body();
  }

  async write(values: Uint8Array, options: ModbusOptions): Promise<void> {
    const response = await this.tapService.tap.service.target.modbusWrite({
      options: options,
      data: values
    });
    if (!response.isSuccessful()) {
      throw response.codeRet();
    }
  }

  monitoring(modbusRead: ModbusReadAnswer): Observable<Monitor<Uint8Array>> {
    const timer = interval(modbusRead.config.monitoringPeriod);
    return new Observable<Monitor<ModbusReadAnswer>>(observer => {
      const subscription = timer.subscribe(async () => {
        try {
          const responseArray = await this.read(true, modbusRead.config);
          observer.next({
            type: 'next',
            answer: responseArray
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
          this._monitoredIds.delete(modbusRead.id);
          console.log('unsubscribed from the monitoring task');
        }
      }
    })
  }

  private _lastReadValue: ModbusReadAnswer;

  get lastReadValue() {
    return this._lastReadValue
  }

  set lastReadValue(val: ModbusReadAnswer) {
    this._lastReadValue = val;
  }

  private _displayOptions: Map<number, DisplayOptions> = new Map();

  setDisplayOptions(address: number, options: DisplayOptions) {
    this._displayOptions.set(address, options)
  }

  getDisplayOptions(address: number): DisplayOptions {
    if (this._displayOptions.has(address)) {
      return this._displayOptions.get(address)
    }
    return undefined;
  }

  private _savedModbusConfig: ModbusConfig

  get savedModbusOptions(): ModbusConfig {
    return this._savedModbusConfig
  }
  saveOptions() {
    this._savedModbusConfig = this.displayedModbusOptions.clone();
  }
  restoreOptions() {
    this.displayedModbusOptions = this._savedModbusConfig.clone();
  }

  async readLast() {
    const dataArray = await this.read()
    this.lastModbusRead = new ModbusReadAnswer(this.savedModbusOptions, dataArray);
  }

  keepLine() {

    if (!this.lastModbusRead) {
      throw new Error('Nothing to store');
    }

    for (let index of this.savedModbusValues.keys()) {
      if (this.savedModbusValues.get(index).isEqual(this.lastModbusRead, false)) {
        console.log('current line already stored');
        return;
      }
    }

    const range = this.lastModbusRead.config.format === VariableFormat._32_BITS ? 4 : 2; // pick 4 bytes if 32bits, 2 otherwise

    let temp = ModbusReadAnswer.store(this.lastModbusRead);
    temp.dataArray = this.lastModbusRead.dataArray.slice(0, range)
    this.savedModbusValues.set(temp.id, temp);
  }

  delete(id: number) {
    this._stopMonitoring(id);
    this.savedModbusValues.delete(id);
  }

  refresh(id?: number) {
    if (!id) {
      return this.readLast();
    }
    if (this.savedModbusValues.has(id)) {
      return this.read(true, this.savedModbusValues.get(id).config);
    }
  }

  private _startMonitoring(id) {
    this._stopMonitoring(id);
    if (!this.savedModbusValues.has(id)) {
      throw new Error('Unknown Command');
    }

    const monitoredModbusRead = this.savedModbusValues.get(id);
    this._monitoredIds.set(id,
      this.monitoring(monitoredModbusRead)
        .subscribe({
          next: val => {
            if (val.type == "next") {
              monitoredModbusRead.dataArray = val.answer;
            } else {
              this.lastError = {
                message: val.answer.message ? val.answer.message : ResultCodeTranslation[val.answer],
                time: new Date()
              }
            }
          },
          complete: () => console.log('monitoring completed')
        })
    );
  }


  private _stopMonitoring(index) {
    if (this._monitoredIds.has(index)) {
      this._monitoredIds.get(index).unsubscribe();
      this._monitoredIds.delete(index);
    }
  }

  toggleMonitoring(index) {
    if (this._monitoredIds.has(index)) {
      this._stopMonitoring(index);
    } else {
      this._startMonitoring(index);
    }
  }

  resetMonitoring(index) {
    if (this._monitoredIds.has(index)) {
      this._stopMonitoring(index);
      this._startMonitoring(index);
    }
  }

  lastError?;

  isMonitored(modbusRead: number | ModbusReadAnswer) {
    
    if (!modbusRead && modbusRead !== 0) {
      return false;
    }
    let id;
    if (typeof modbusRead != 'number') {
      if (!modbusRead.id) {
        return false;
      }
      id = modbusRead.id
    } else {
      id = modbusRead
    }

    return this._monitoredIds.has(id);
  }

  private _monitoredIds: Map<number, Subscription>; // Set of monitored Ids

  lastModbusRead?: ModbusReadAnswer
  
  savedModbusValues: Map<number, ModbusReadAnswer>; // Mapped by Ids

  mockValues() {
  
    this.lastModbusRead = new ModbusReadAnswer(
      this.displayedModbusOptions,
      new Uint8Array([1,2])
      );
      console.log(this.lastModbusRead);
    }

}

export type Monitor<T> = {
  type: 'next' | 'error',
  answer: T | any
}