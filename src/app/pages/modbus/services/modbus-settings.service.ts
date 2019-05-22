import { Injectable } from '@angular/core';
import { UartSettings, ModbusOptions, VariableFormat } from '@iotize/device-client.js/device/model';
import { LoggerService } from '../../terminal/services/logger.service';
import { Events } from '@ionic/angular';
import { IoTizeTap } from 'iotize-ng-com';
import { ResultCodeTranslation, ResultCode } from '@iotize/device-client.js/client/api/response';
import { TapService } from 'src/app/services/tap.service';

@Injectable({
  providedIn: 'root'
})
export class ModbusSettingsService {
  public BAUD_RATES: Array<number> = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200,
    187500, 230400, 460800, 921600];

  didFetchSettings = false;
  _settings: UartSettings; // real settings
  settings: UartSettings; // displayed settings

  constructor(public logger: LoggerService,
    public deviceService: TapService,
    public events: Events) {
    this._settings = {
      physicalPort: UartSettings.PhysicalPort.USB,
      stopBit: UartSettings.StopBit.ONE,
      bitParity: UartSettings.BitParity.NONE,
      dataBitsLength: UartSettings.DataBitsLength._7,
      handshakeValue: UartSettings.Handshake.NONE,
      handshakeDelimiter: UartSettings.HandshakeDelimiter.NONE,
      timeout: 50,
      baudRate: 187500,
      ofs: false,
      slv: 0
    };
    this.settings = Object.assign({}, this._settings);
    this.eventSubscribe();
  }

  async getUARTSettings(): Promise<void> {
    try {
      const response = await this.deviceService.tap.service.target.getUARTSettings();

      if (response.isSuccess()) {
        this._settings = response.body();
        console.log(this._settings);
        this.settings = Object.assign({}, this._settings);
        this.didFetchSettings = true;
        return;
      }
      this.didFetchSettings = false;
      throw new Error('getUARTSettings response failed');

    } catch (error) {
      this.didFetchSettings = false;
      throw error;
    }
  }

  async setUARTSettings(): Promise<void> {
    return this._setUARTSettings(true);
  }
  private async _setUARTSettings(firstTry: boolean, triedReconnection = false): Promise<void> {
    try {
      console.log('>>>>>>> waiting after disconnect');
      await this.deviceService.tap.service.target.disconnect();

      console.log('>>>>>>> setUARTSettings');
      const response = await this.deviceService.tap.service.target.setUARTSettings(this._settings);
      if (response.isSuccess()) {
        console.log('>>>>>>> connecting');
        await this.deviceService.tap.service.target.connect();
        return;
      } else {
        if (response.codeRet() == ResultCode.IOTIZE_401_UNAUTHORIZED) {
          throw ResultCode.IOTIZE_401_UNAUTHORIZED;
        }
        throw new Error('setUARTSettings response failed');
      }

    } catch (error) {
      if (firstTry) {
        console.log('[setUARTSettings] Second attempt');
        return this._setUARTSettings(false);
      }
if (!triedReconnection){
      try {
        await this.handleDisconnection();
        return this._setUARTSettings(false, true);
      } catch (handleDisconnectionError) {
        console.error(handleDisconnectionError);
      }}
      
      this.logger.log('error', error);
      throw (error);
    }
  }

  // These are to be able to bind ofs to a select button
  // otherwise a 0 value automatically sets itself as undefined

  get ofs() {
    return this.settings.ofs.toString();
  }

  set ofs(value: string) {
    this.settings.ofs = Boolean(value);
  }

  get physicalPort() {
    return this.settings.physicalPort.toString();
  }
  set physicalPort(value) {
    this.settings.physicalPort = Number(value);
  }
  get handshakeValue() {
    return this.settings.handshakeValue.toString();
  }
  set handshakeValue(value) {
    this.settings.handshakeValue = Number(value);
  }
  get handshakeDelimiter() {
    return this.settings.handshakeDelimiter.toString();
  }
  set handshakeDelimiter(value) {
    this.settings.handshakeDelimiter = Number(value);
  }
  get dataBitsLength() {
    return this.settings.dataBitsLength.toString();
  }
  set dataBitsLength(value) {
    this.settings.dataBitsLength = Number(value);
  }
  get bitParity() {
    return this.settings.bitParity.toString();
  }
  set bitParity(value) {
    this.settings.bitParity = Number(value);
  }
  get stopBit() {
    return this.settings.stopBit.toString();
  }
  set stopBit(value) {
    this.settings.stopBit = Number(value);
  }

  async applyChanges() {
    // REAL IMPLEMENTATION
    try {
      this._settings = Object.assign({}, this.settings);
      await this.setUARTSettings();
    } catch (error) {
      this.logger.log('error', error);
      throw error;
    }
  }

  discardChanges() {
    this.settings = Object.assign({}, this._settings);
  }

  settingsHasChanged(): boolean {

    for (const prop in this._settings) {
      if (this.settings[prop] !== this._settings[prop]) {
        return true;
      }
    }
    return false;
  }

  eventSubscribe() {
    this.events.subscribe('connected', () => this.getUARTSettings());
  }


  async autoDetectBaudRate() {
    const originalTimeOut = this.settings.timeout;
    let isValidBaudRate = false;
    for (let rate of this.BAUD_RATES) {
      console.log(`testing ${rate}`);
      isValidBaudRate = await this.testOneBaudRate(rate);
        if (isValidBaudRate) {
        break;
      }
    }
    this.settings.timeout = originalTimeOut;
    this.applyChanges();
    if (isValidBaudRate) {
      return this.settings;
    }
    throw new Error('Couldn\'t find baudRate');
  }

  async testOneBaudRate(rate: number) {
    this.settings.baudRate = rate;
    this.settings.bitParity = UartSettings.BitParity.NONE;
    console.log(`Setting UART with ${rate} bps, parity NONE`);
    await this.applyChanges();
    let isValidConfig = await this.modbusReadWithTimeout();
    if (isValidConfig) {
      return true;
    }
    this.settings.bitParity = UartSettings.BitParity.ODD;
    console.log(`Setting UART with ${rate} bps, parity ODD`);
    await this.applyChanges();
    isValidConfig = await this.modbusReadWithTimeout();
    if (isValidConfig) {
      return true;
    }
    this.settings.bitParity = UartSettings.BitParity.EVEN;
    console.log(`Setting UART with ${rate} bps, parity EVEN`);
    await this.applyChanges();
    isValidConfig = await this.modbusReadWithTimeout();
    if (isValidConfig) {
      return true;
    }
    return false;

  }

  modbusReadWithTimeout(timeout: number = 1000): Promise<boolean> {
    let _this = this;
    return new Promise(async function(resolve) {
      // setTimeout(() => {resolve(false)}, timeout);
      // try {
      //   await this.deviceService.tap.service.target.modbusRead({
      //     objectType: ModbusOptions.ObjectType.DEFAULT,
      //     address: 320,
      //     format: VariableFormat._1_BIT,
      //     length: 1,
      //     slave: 1
      //   });
      //   resolve(true);
      // } catch (error) {
      //   console.error('[modbusReadWithTimeout] ERROR');
      //   console.error(error);
      //   resolve(false);
      // }
      try {

        const response = await _this.deviceService.tap.service.target.modbusRead({
          objectType: ModbusOptions.ObjectType.DEFAULT,
          address: 0,
          format: VariableFormat._16_BITS,
          length: 1,
          slave: 1
        });
        console.log(`Returned Code: ${ResultCodeTranslation[response.codeRet()]}`)
        resolve(response.isSuccessful() || response.codeRet() != ResultCode.IOTIZE_TARGET_PROTOCOL_LOST_COM);
      } catch (error) {
          console.error('[modbusReadWithTimeout] ERROR');
          console.error(error);
          resolve(false);
        }
    });
  }
  async handleDisconnection() {
    const isConnected = this.deviceService.tap.isConnected();
    console.log(`Device is ${isConnected? '' : 'not'} connected`);
    // if (!isConnected) {
      await this.deviceService.tap.connect();
    // }
  }
}
