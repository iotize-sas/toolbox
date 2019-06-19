import { Component, ChangeDetectorRef } from '@angular/core';
import { DiscoveredDeviceType } from 'iotize-ng-com';
import { ToastController, LoadingController, Events, Platform } from '@ionic/angular';
import { ComService } from '../../services/com.service';
import { Subscription } from 'rxjs';
import { TapService } from 'src/app/services/tap.service';
import { NfcService } from 'src/app/services/nfc.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(public comService: ComService,
    public tapService: TapService,
    private toast: ToastController,
    private changeDetector: ChangeDetectorRef,
    public loadingCtrl: LoadingController,
    public nfc: NfcService,
    public events: Events,
    public platform: Platform) {
    this.deviceArraySubscribe();
    this.nfc.listenNFC();
    this.nfcPairingSubscribe();
    this.isIOS = this.platform.is("ios");
  }

  devices: DiscoveredDeviceType[] = [];
  private deviceArraySubscription: Subscription;
  private deviceArraySubscribe() {
    this.deviceArraySubscription = this.comService.devicesArray().subscribe(arr => this.devices = arr.sort((a,b) => b.rssi -a.rssi));
  }
  isIOS: boolean;
  startScan() {
    this.comService.startScan().subscribe({ error: err => this.handleError(err) });
    // .subscribe(
    //   device => {
    //     console.log(device);
    //       this.devices.push(device);
    //       this.changeDetector.detectChanges();
    //   });
  }

  async stopScan() {
    console.log("stop scan");
    await this.comService.stopScan();
    this.changeDetector.detectChanges();
  }

  async connect(device: DiscoveredDeviceType) {
    if (this.comService.isScanning) {
      await this.stopScan();
    }
    const loader = await this.loadingCtrl.create({
      message: 'Connecting to ' + device.name
    });

    loader.present();

    const connectionProtocol = this.comService.getProtocol(device);
    try {
      await this.tapService.init(connectionProtocol);
      loader.dismiss();
      this.events.publish('connected');
      this.showToast('Connected to ' + device.name);
      this.changeDetector.detectChanges();
    } catch (error) {
      if (error.code == "ConnectionError") {
        //retry once to connect
        loader.message = 'Connecting to ' + device.name + ' second attempt';
        try {
          await this.tapService.init(connectionProtocol);
          loader.dismiss();
          this.events.publish('connected');
          this.showToast('Connected to ' + device.name);
          this.changeDetector.detectChanges();
          return;
        } catch (secondError) {
          loader.dismiss();
          this.handleError(error);
          await this.disconnect();
          return;
        }
      }
      loader.dismiss();
      this.handleError(error);
      await this.disconnect();
      return;
    }
  }

  async disconnect() {

    const loader = await this.loadingCtrl.create({
      message: 'Disconnecting'
    });

    loader.present();
    try {
      await this.tapService.disconnect();
    } catch (error) {
      this.showError(error);
    }
    loader.dismiss();
    this.comService.selectedDevice = null;
  }

  clear() {
    this.deviceArraySubscription.unsubscribe();
    this.comService.clearDevices();
    this.deviceArraySubscribe();
  }

  refreshDevices(event) {
    console.log("refreshing devices");
    try {

      if (this.comService.isScanning) {
        this.stopScan();
      }
      this.clear();
      this.startScan();
      event.target.complete();
    } catch (error) {
      event.target.complete();
      console.error(error);
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    let errorString = '';
    if (typeof error === "string") {
      errorString = error;
    } else if (error.message) {
      errorString = error.message;
    } else {
      errorString = error.toString();
    }
    this.showError(errorString);
  }

  private async showError(errorMessage: string) {
    const toast = await this.toast.create({
      message: errorMessage,
      duration: 0,
      showCloseButton: true
    });
    toast.present();
  }

  async showToast(message: string, duration: number = 3000): Promise<void> {
    const toast = await this.toast.create({
      message: message,
      duration: duration
    });

    toast.present();
  }

  isConnected(device: DiscoveredDeviceType) {
    let isConnected = false;
    if (this.tapService.isReady && this.comService.selectedDevice) {
      isConnected = device.address == this.comService.selectedDevice.address
    }
    return isConnected;
  }

  nfcPairingSubscribe() {
    this.events.subscribe('NFCPairing', (tag: DiscoveredDeviceType) => {
      if (this.devices.find(el => el.address == tag.address && el.name == tag.name) == undefined) {
        this.devices.unshift(tag);
      } 
    });
  }
  beginSession() {
    this.nfc.nfc.beginSession();
  }
}
