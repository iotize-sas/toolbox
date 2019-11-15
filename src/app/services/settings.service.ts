import { Injectable } from '@angular/core';
import { UartSettings, ModbusOptions, VariableFormat } from '@iotize/device-client.js/device/model';
import { TapService } from './tap.service';
import { Events } from '@ionic/angular';
import { ResultCode, ResultCodeTranslation } from '@iotize/device-client.js/client/api/response';
import { ConnectionState } from '@iotize/device-client.js/protocol/api';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public BAUD_RATES: Array<number> = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200,
    187500, 230400, 460800, 921600];

  didFetchSettings = false;
  _settings: UartSettings; // real settings
  settings: UartSettings; // displayed settings

  stopAutoBaud = false;

  constructor(
    public tapService: TapService,
    public events: Events) {
    this.eventSubscribe();
  }

  async getUARTSettings(): Promise<void> {
    try {
      const response = await this.tapService.tap.service.target.getUARTSettings();

      if (response.isSuccess()) {
        this._settings = response.body();
        this.settings = Object.assign({}, this._settings);
        this.didFetchSettings = true;
        return;
      }
      if (response.codeRet() === ResultCode.IOTIZE_401_UNAUTHORIZED) {
        this.didFetchSettings = false;
        await this.tapService.sessionStateForceUpdate();
        throw new Error('Login required');
      }
      throw new Error('getUARTSettings response failed: ' + ResultCodeTranslation[response.codeRet()]);

    } catch (error) {
      throw error;
    }
  }

  async setUARTSettings(): Promise<void> {
    return this._setUARTSettings(true);
  }

  private async _setUARTSettings(firstTry: boolean, triedReconnection = false): Promise<void> {
    try {
      console.log('>>>>>>> waiting after disconnect');
      await this.tapService.tap.service.target.disconnect();

      console.log('>>>>>>> setUARTSettings');
      const response = await this.tapService.tap.service.target.setUARTSettings(this._settings);
      if (response.isSuccess()) {
        console.log('>>>>>>> connecting');
        await this.tapService.tap.service.target.connect();
        return;
      } else {
        if (response.codeRet() == ResultCode.IOTIZE_401_UNAUTHORIZED) {
          throw ResultCodeTranslation[ResultCode.IOTIZE_401_UNAUTHORIZED];
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
    const initialSettings = Object.assign({}, this._settings);
    try {
      this._settings = Object.assign({}, this.settings);
      await this.setUARTSettings();
      this.events.publish('needChangeDetection');
    } catch (error) {
      this._settings = Object.assign({}, initialSettings);
      this.getUARTSettings();
      this.events.publish('needChangeDetection');
      throw (error);
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
    this.tapService.connectionState.subscribe(state => {
      if (state == ConnectionState.CONNECTED)
        return this.getUARTSettings().catch(error => this.events.publish('error-message', error.message))

      if (state == ConnectionState.DISCONNECTED)
      this.didFetchSettings = false
    });
    this.events.subscribe('logged-in', () => {
      if (!this.didFetchSettings) {
        if (this.tapService.didReconnect) {
          return this.setUARTSettings().catch(error => this.events.publish('error-message', error.message))
        }
        return this.getUARTSettings().catch(error => this.events.publish('error-message', error.message))
      }
    });
  }

  async handleDisconnection() {
    const isConnected = this.tapService.tap.isConnected();
    console.log(`Device is ${isConnected? '' : 'not'} connected`);
    if (!isConnected) {
      await this.tapService.tap.connect();
    }
  }

  async autoDetectBaudRate() {
    this.stopAutoBaud = false;
    const originalTimeOut = this.settings.timeout;
    this.settings.timeout = 20;
    let isValidBaudRate = false;
    for (let rate of this.BAUD_RATES) {
      console.log(`testing ${rate}`);
      isValidBaudRate = await this.testOneBaudRate(rate);
        if (isValidBaudRate || this.stopAutoBaud) {
        break;
      }
    }
    this.settings.timeout = originalTimeOut;
    this.applyChanges();
    if (isValidBaudRate) {
      return this.settings;
    }
    this.settings.timeout = originalTimeOut;
    throw new Error('Couldn\'t find baudRate');
  }

  async testOneBaudRate(rate: number) {
    this.settings.baudRate = rate;
    this.settings.bitParity = UartSettings.BitParity.NONE;
    console.log(`Setting UART with ${rate} bps, parity NONE`);
    await this.applyChanges();
    let isValidConfig = await this.modbusReadWithTimeout();
    if (isValidConfig || this.stopAutoBaud) {
      return isValidConfig;
    }
    this.settings.bitParity = UartSettings.BitParity.ODD;
    console.log(`Setting UART with ${rate} bps, parity ODD`);
    await this.applyChanges();
    isValidConfig = await this.modbusReadWithTimeout();
    if (isValidConfig || this.stopAutoBaud) {
      return isValidConfig;
    }
    this.settings.bitParity = UartSettings.BitParity.EVEN;
    console.log(`Setting UART with ${rate} bps, parity EVEN`);
    await this.applyChanges();
    isValidConfig = await this.modbusReadWithTimeout();
    if (isValidConfig || this.stopAutoBaud) {
      return isValidConfig;
    }
    return false;

  }

  modbusReadWithTimeout(timeout: number = 500): Promise<boolean> {
    let _this = this;
    return new Promise(async function(resolve) {

      try {

        const response = await _this.tapService.tap.service.target.modbusRead({
          objectType: ModbusOptions.ObjectType.DEFAULT,
          address: 1,
          format: VariableFormat._16_BITS,
          length: 1,
          slave: 1
        });
        console.log(`Returned Code: ${ResultCodeTranslation[response.codeRet()]}`)
        resolve(response.isSuccessful() || response.codeRet() != ResultCode.IOTIZE_TARGET_PROTOCOL_LOST_COM);
      } catch (error) {
          console.error('[modbusReadWithTimeout] ERROR', error);
          resolve(false);
        }
    });
  }

}
