import { Injectable } from '@angular/core';
import { IoTizeTap } from 'iotize-ng-com';
import { ComProtocol } from '@iotize/device-client.js/protocol/api';
import { TargetProtocol } from '@iotize/device-client.js/device/model';
import { NFCComProtocol } from 'plugins/cordova-plugin-iotize-device-com-nfc';
import { SessionState } from '@iotize/device-client.js/device';
import { BLEComProtocol } from 'plugins/cordova-plugin-iotize-ble';
import { Events, LoadingController, ToastController } from '@ionic/angular';
import { NFCTag } from './nfc.service';

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

  constructor(public iotizeTap: IoTizeTap, public events: Events, public loading: LoadingController, public toast: ToastController) { 
    this.events.subscribe('tag-discovered', (tag: NFCTag) => {
      if (!this.isReady) {
        this.NFCLoginAndBLEPairing(tag).then(() => {
          this.events.publish('connected', tag.appName);
        });
      }
    });
  }
    get tap() {
      return this.iotizeTap.tap;
    }

    async init(comProtocol: ComProtocol){
      try {
        await this.iotizeTap.init(comProtocol);
      } catch (err) {
        console.error("[TapService]: init failed");
        console.error(err);
        throw err;
      }
      // Disconnect from target, check for current protocol and connect if Modbus or Serial is available
      try {
        await this.tap.service.target.disconnect();
      } catch (err) {
        if (err.code != 'ConnectionError') { // not a connection problem if there's no target
          throw err
        }
        console.log('no target connected');
        return;
      }
      const protocol = (await this.tap.service.target.getProtocol()).body();
      if (protocol !== TargetProtocol.MODBUS && protocol !== TargetProtocol.SERIAL_STANDARD && protocol !== TargetProtocol.SERIAL_VIA_TAPNPASS) {
        await this.disconnect();
        throw new Error("Tap is not configured for serial or modbus communication");
      }
        await this.tap.service.target.connect();
    }

    disconnect(){
      if (this.tap) {
        return this.iotizeTap.disconnect();
      }
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

    async NFCLoginAndBLEPairing(tag: NFCTag){
      const loader = await this.loading.create({
        message: `Connecting to ${tag.appName}`
      });

      loader.present();

      try {
        //start a communication session in NFC
        await this.init(new NFCComProtocol());
        
        //enable NFC auto login
        await this.tap.encryption(true);
        
        //check the user login
        let sessionState: SessionState = await this.tap.refreshSessionState();
        const nfcSessionStateString =  JSON.stringify(sessionState);
        console.log(`NFCLoginAndBLEPairing in NFC:  ` + nfcSessionStateString);

        loader.message = `Logged as ${sessionState.name}, switching to BLE`;
        
        //connect to the device in BLE
        let bleCom : ComProtocol= new BLEComProtocol(tag.macAddress);
        //start the BLE communication with the device
        await this.tap.useComProtocol(bleCom).connect();
        
        //check the connection
        sessionState = await this.tap.refreshSessionState();
        const bleSessionStateString = JSON.stringify(sessionState);
        console.log(`NFCLoginAndBLEPairing in BLE:  `+ bleSessionStateString);
        this.events.publish('NFCPairing', {
          name: tag.appName,
          address: tag.macAddress
        });
        loader.dismiss();
      } catch (err) {
        this.iotizeTap.isReady = false;
        this.events.publish('closeNFC');
      console.error("Can't connect to TAP, try again" + JSON.stringify(err));
      console.error(err);
      loader.dismiss();
      const toast = await this.toast.create({message:"Can't connect to TAP, try again",position:"middle", showCloseButton:true});
      toast.present();
      throw err;
      }
     
    }
}
