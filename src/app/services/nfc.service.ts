import { Injectable } from '@angular/core';
import { NFC, NdefEvent } from '@ionic-native/nfc/ngx'
import { Events } from '@ionic/angular';

declare var nfc;

export interface NFCTag{
  appName: string;
  macAddress: string;
}

@Injectable({
  providedIn: 'root'
})
export class NfcService {

  public lastTagRead:NFCTag = {
    appName: "",
    macAddress: ""
  };

  constructor(public nfc: NFC,
    public events: Events) {
      this.events.subscribe('NFCPairing', () => {
        this.closeNFC();
      })
      this.events.subscribe('closeNFC', () => {
        this.closeNFC();
      })
    }

  listenNFC() {
    this.nfc.addNdefListener(() => {
      console.log('NFC listener ON')
    },
      (error) => {
        console.error('NFC listener didn\'t start: ', error)
      }).subscribe(event => {
        console.log('NDEF Event')
        this.onDiscoveredTap(event);
        this.events.publish('tag-discovered', this.lastTagRead);
      });
    this.nfc.addMimeTypeListener("application/com.iotize.toolbox",() => {
      console.log('Mime listener ON')
    },
      (error) => {
        console.error('Mime listener didn\'t start: ', error)
      }).subscribe(event => {
        console.log('Mime Event')
        this.onDiscoveredTap(event);
        this.events.publish('tag-discovered', this.lastTagRead);
      });
  }

  onDiscoveredTap(event: NdefEvent) {
    let message = event.tag.ndefMessage;
    this.lastTagRead.appName = String.fromCharCode(...message[3].payload.filter(byte => byte != 0));
    this.lastTagRead.macAddress = this.convertBytesToBLEAddress(message[2].payload);
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
    nfc.close();
  }
}