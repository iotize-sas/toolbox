import { Injectable } from '@angular/core';
import { IoTizeTap } from 'iotize-ng-com';
import { ComProtocol } from '@iotize/device-client.js/protocol/api';
import { TargetProtocol } from '@iotize/device-client.js/device/model';

@Injectable({
  providedIn: 'root'
})
export class TapService {
  get session() {
    return this.iotizeTap.session;
  };
  sessionState() {
    return this.iotizeTap.sessionState();
  }
  sessionStateForceUpdate() {
    return this.iotizeTap.sessionStateForceUpdate();
  }

  constructor(public iotizeTap: IoTizeTap) { 
  }
    get tap() {
      return this.iotizeTap.tap;
    }

    async init(comProtocol: ComProtocol){
      await this.iotizeTap.init(comProtocol);
      // Disconnect from target, check for current protocol and connect if Modbus or Serial is available
      await this.tap.service.target.disconnect();
      const protocol = (await this.tap.service.target.getProtocol()).body();
      if (protocol !== TargetProtocol.MODBUS && protocol !== TargetProtocol.SERIAL_STANDARD && protocol !== TargetProtocol.SERIAL_VIA_TAPNPASS) {
        await this.disconnect();
        throw new Error("Tap is not configured for serial or modbus communication");
      }
      await this.tap.service.target.connect();

    }

    disconnect(){
      return this.iotizeTap.disconnect();
    }

    get isReady() {
      return this.iotizeTap.isReady;
    }

    login(user: string, password: string) {
      return this.iotizeTap.login(user, password);
    }
    
    logout() {
      return this.iotizeTap.logout();
    }
}
