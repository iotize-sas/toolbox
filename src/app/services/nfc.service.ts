import { Injectable } from '@angular/core';
import { NFC, NdefEvent } from '@ionic-native/nfc/ngx'
import { Events } from '@ionic/angular';

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
    public events: Events) { }

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
  }

  onDiscoveredTap(event: NdefEvent) {
    let message = event.tag.ndefMessage;
    this.lastTagRead.appName = String.fromCharCode(...message[3].payload);
    this.lastTagRead.macAddress = this.convertBytesToBLEAddress(message[2].payload);
  }

  convertBytesToBLEAddress(bytes: number[]): string {
    return bytes.slice(1)
                .map(byte => {
                  if (byte < 0) {
                    byte += 256;
                  }
                  return byte.toString(16).toUpperCase();
                })
                .reverse()
                .join(':')
  }
}