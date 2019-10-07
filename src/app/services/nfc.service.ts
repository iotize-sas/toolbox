import { Injectable } from '@angular/core';
import { NFC, NdefEvent } from '@ionic-native/nfc/ngx'
import { Events, Platform } from '@ionic/angular';
import { Observable, fromEvent } from 'rxjs';
import { IoTizeComService } from '@iotize/ng-com-services';
import { DiscoveredDeviceType } from 'plugins/cordova-plugin-iotize-ble';
import { NFCComProtocol } from '@iotize/device-com-nfc.cordova';
import { ComProtocolOptions, ComProtocol } from '@iotize/device-client.js/protocol/api';

declare var nfc;

export interface NFCTag {
  appName: string;
  macAddress: string;
}

@Injectable({
  providedIn: 'root'
})
export class NfcService implements IoTizeComService {

  private isListening = false;

  public lastTagRead: NFCTag = {
    appName: "",
    macAddress: ""
  };

  private lastEvent: NdefEvent;
  private allowMime: boolean;

  constructor(public nfc: NFC,
    public events: Events, public platform: Platform) {
    this.events.subscribe('NFCPairing', () => {
      this.closeNFC();
    })
    this.events.subscribe('closeNFC', () => {
      this.closeNFC();
    })
  }

  forceMimeHandle() {
    if (this.allowMime) {
      console.log('last event:');
      console.log(this.lastEvent);
      this.onDiscoveredTap();
    }
  }

  listenNFC() {
    if (this.isListening) {
      console.log('NFC listener already set up');
      return;
    }

    // if (this.platform.is('ios')) {
    //   console.log('no listener on iOS');
    //   return;
    // }

    this.addNdefListener(() => {
      console.log('NFC listener ON');
      this.isListening = true;
    },
      (error) => {
        console.error('NFC listener didn\'t start: ', error)
      }).subscribe(event => {
        console.log('NDEF Event')
        this.lastEvent = event;
        this.onDiscoveredTap();
      });

    if (this.platform.is('android')) { // listen for the tag that openned the app 

      this.nfc.addMimeTypeListener("application/com.iotize.toolbox", () => {
        console.log('Mime listener ON')
      },
        (error) => {
          console.error('Mime listener didn\'t start: ', error)
        }).subscribe(event => {
          console.log('Mime Event');
          this.lastEvent = event;
          this.allowMime = true;
          this.onDiscoveredTap();
        });
    }
  }

  onDiscoveredTap(event?: NdefEvent) {
    if (!event) {
      event = this.lastEvent
    }
    let message = event.tag.ndefMessage;
    this.lastTagRead.appName = String.fromCharCode(...message[3].payload.filter(byte => byte != 0));
    this.lastTagRead.macAddress = this.convertBytesToBLEAddress(message[2].payload);
    this.events.publish('tag-discovered', this.lastTagRead);

  }

  convertBytesToBLEAddress(bytes: number[]): string {
    return bytes.slice(1)
      .map(byte => {
        if (byte < 0) {
          byte += 256;
        }
        return ('0' + byte.toString(16).toUpperCase()).slice(-2);
      })
      .reverse()
      .join(':')
  }

  closeNFC() {
    console.log('closing NFC technology');
    nfc.close();
  }

  beginNDEFSession() {
    return new Promise((resolve, reject) => {

      const successCallBack = (data) => {
        console.log('iOSreadNDEFTag data');
        console.log(data);
        const jsonObject = JSON.parse(data);
        this.lastEvent = {
          tag: jsonObject
        };
        this.onDiscoveredTap();
        resolve();
      }

      const errorCallBack = (error) => {
        console.log('iOSreadNDEFTag error');
        console.log(error);
        reject(error);
      }

      const message = 'Get close to an IoTize Tap';

      nfc.beginNDEFSession(successCallBack, errorCallBack, message);
    })
  }

  beginSession(success?: Function, failure?: Function) {
    return nfc.beginSession(success, failure)
  }

  addNdefListener(onSuccess?: Function, onFailure?: Function): Observable<any> {

    console.log('addNdefListener called');
    return fromEvent(document, 'ndef');

  }

  startScan(): Observable<DiscoveredDeviceType> {
    throw new Error('not Implemented');
  }
  
  checkAvailable(): Promise<void> {
    throw new Error('not Implemented');
  }
  stopScan(): void | Promise<void> {
    throw new Error('not Implemented');
  }
  getProtocol(device: any, options?: ComProtocolOptions): ComProtocol {
    if (this.platform.is('ios')) {
      return NFCComProtocol.iOSProtocol();
    }
    return new NFCComProtocol();
  }

  devicesArray(): Observable<DiscoveredDeviceType[]> {
    throw new Error('not Implemented');
  }
  clearDevices(except?: DiscoveredDeviceType[]): void {
    throw new Error('not Implemented');
  }
}

