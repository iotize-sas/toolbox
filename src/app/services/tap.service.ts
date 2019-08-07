import { Injectable } from '@angular/core';
import { IoTizeTap } from '@iotize/ng-com-services';
import { ComProtocol } from '@iotize/device-client.js/protocol/api';
import { TargetProtocol } from '@iotize/device-client.js/device/model';
import { NFCComProtocol } from '@iotize/device-com-nfc.cordova';
import { SessionState } from '@iotize/device-client.js/device';
import { BLEComProtocol, DiscoveredDeviceType } from '@iotize/cordova-plugin-iotize-ble';
import { Events, LoadingController, ToastController, Platform } from '@ionic/angular';
import { NFCTag } from './nfc.service';
import { ResultCodeTranslation } from '@iotize/device-client.js/client/api/response';
import { NFCIosComProtocol } from '../helpers/nfc-ios-com-protocol';
import { ComService } from './com.service';

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

  constructor(public iotizeTap: IoTizeTap,
    public events: Events,
    public loading: LoadingController,
    public toast: ToastController,
    public platform: Platform,
    public com: ComService) { 
    this.events.subscribe('tag-discovered', (tag: NFCTag) => {
      if (!this.tap || !this.tap.isConnected() || !this.isReady) {
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
        //retry
        try {
          await this.iotizeTap.init(comProtocol);
        } catch(err){
          console.error("[TapService]: init failed");
          console.error(err);
          throw err;
        }
      }
      // Disconnect from target, check for current protocol and connect if Modbus or Serial is available
      try {
        const response = await this.tap.service.target.disconnect();
        if (!response.isSuccessful()) {
          this.disconnect();
          throw new Error(ResultCodeTranslation[response.codeRet()]);
        }
      } catch (err) {
        console.error('[TapService] ', err.message? err.message: err);
      // throw err;
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
        return this.tap.disconnect();
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

      const discoveredDevice: DiscoveredDeviceType = {
        name: tag.appName,
        address: tag.macAddress
      };

      const bleOptions = {
        connect: {
          timeout: 2000
        },
        disconnect: {
          timeout: 2000
        },
        send: {
          timeout: 2000
        } 
      };

      try {
        //start a communication session in NFC
        let nfcProtocol: ComProtocol;
        if (this.platform.is('ios')) {
          nfcProtocol = new NFCIosComProtocol();
        } else {
          nfcProtocol = new NFCComProtocol();
        }
        await this.init(nfcProtocol);
        
        //enable NFC auto login
        await this.tap.encryption(true);
        
        //check the user login
        let sessionState: SessionState = await this.tap.refreshSessionState();
        const nfcSessionStateString =  JSON.stringify(sessionState);
        console.log(`NFCLoginAndBLEPairing in NFC:  ` + nfcSessionStateString);

        loader.message = `Logged as ${sessionState.name}, switching to BLE`;
        
        let realDevice;
        //connect to the device in BLE
        if (this.platform.is('ios')) {
          realDevice = await this.com.scanForSpecificDevice(discoveredDevice.name);
        } else {
          realDevice = discoveredDevice;
        }

        let bleCom : ComProtocol = new BLEComProtocol(realDevice.address, bleOptions);
        //start the BLE communication with the device
        await this.tap.useComProtocol(bleCom).connect();
        
        if (this.platform.is('ios')) {
          console.log('Close NFC Session');
          nfcProtocol.disconnect(); // End NFC reading session
        }

        //check the connection
        sessionState = await this.tap.refreshSessionState();
        const bleSessionStateString = JSON.stringify(sessionState);
        console.log(`NFCLoginAndBLEPairing in BLE:  `+ bleSessionStateString);

        this.events.publish('NFCPairing', realDevice);
        loader.dismiss();
      } catch (err) {
        this.iotizeTap.isReady = false;
        console.error("Can't connect to TAP, try again" + JSON.stringify(err));
        try {
          console.log('tryig to connect directly through BLE');
          
          let realDevice;
          //connect to the device in BLE
          if (this.platform.is('ios')) {
            realDevice = await this.com.scanForSpecificDevice(discoveredDevice.name);
          } else {
            realDevice = discoveredDevice;
          }

          let bleCom : ComProtocol = new BLEComProtocol(realDevice, bleOptions);
          //start the BLE communication with the device
          await this.init(bleCom);
          this.events.publish('NFCPairing', realDevice);
          loader.dismiss();
          return;
        } catch (error) {
          console.error('BLE only try failed');
          err = error;
        } 
        // this.events.publish('closeNFC');
      console.error(err);
      loader.dismiss();
      const toast = await this.toast.create({message:"Can't connect to TAP, try again",position:"middle", showCloseButton:true});
      toast.present();
      throw err;
      }
     
    }
}
