import { Injectable } from '@angular/core';
import { UartSettings } from '@iotize/device-client.js/device/model';
import { LoggerService } from '../pages/terminal/services/logger.service';
import { TapService } from './tap.service';
import { Events } from '@ionic/angular';
import { ResultCode, ResultCodeTranslation } from '@iotize/device-client.js/client/api/response';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public BAUD_RATES: Array<number> = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200,
    187500, 230400, 460800, 921600];

  didFetchSettings = false;
  _settings: UartSettings; // real settings
  settings: UartSettings; // displayed settings

  constructor(public logger: LoggerService,
    public tapService: TapService,
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
    try {
      this._settings = Object.assign({}, this.settings);
      await this.setUARTSettings();
    } catch (error) {
      if (error.message) {
        this.logger.log('error', error.message);
      } else {
        this.logger.log('error', error);
      }
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
    this.events.subscribe('connected', () => this.getUARTSettings().catch(error => this.events.publish('error-message', error.message)));
    this.events.subscribe('logged-in', () => {
      if (!this.didFetchSettings) {
        this.getUARTSettings().catch(error => this.events.publish('error-message', error.message))
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

}
