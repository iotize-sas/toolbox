import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { DiscoveredDeviceType } from '@iotize/ng-com-services';
import { ToastController, LoadingController, Events, Platform } from '@ionic/angular';
import { ComService } from '../../services/com.service';
import { Subscription } from 'rxjs';
import { TapService } from 'src/app/services/tap.service';
import { NfcService } from 'src/app/services/nfc.service';
import { groupBy, map } from 'rxjs/operators';
import { RssiToBarsPipe } from 'src/app/pipes/rssiToBars/rssi-to-bars.pipe';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{
  constructor(public comService: ComService,
    public tapService: TapService,
    private toast: ToastController,
    private changeDetector: ChangeDetectorRef,
    public loadingCtrl: LoadingController,
    public nfc: NfcService,
    public events: Events,
    public platform: Platform) {
  }

  ngOnInit() {
    this.deviceArraySubscribe();
    // this.nfc.listenNFC();
    this.nfc.forceMimeHandle();
    this.nfcPairingSubscribe();
    this.events.subscribe('connected', () => this.changeDetector.detectChanges());
  }

  devices: DiscoveredDeviceType[] = [];
  private deviceArraySubscription: Subscription;
  private deviceArraySubscribe() {
    const rssiPipe = new RssiToBarsPipe();
    this.deviceArraySubscription = this.comService.devicesArray().subscribe(arr => {
      this.devices = arr.sort((a, b) => rssiPipe.transform(b.rssi) - rssiPipe.transform(a.rssi));
      console.log('new deviceArray, detecting changes');
      this.changeDetector.detectChanges();
    });
  }
  get isIOS() {
    return this.platform.is('ios');
  }

  get isScanning() {
    return this.comService.isScanning
  }

  get scanMessage() {
    return `${this.isScanning? 'Stop' : 'Start'} Scan`;
  }

  startScan() {
    this.comService.startScan();
  }

  toggleScan() {
    if (this.isScanning) {
      return this.stopScan();
    }
    return this.startScan();
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
      await this.tapService.init(connectionProtocol, device);
      loader.dismiss();
      this.events.publish('connected');
      this.showToast('Connected to ' + device.name);
      this.changeDetector.detectChanges();
    } catch (error) {
      if (error.code == "ConnectionError") {
        //retry once to connect
        loader.message = 'Connecting to ' + device.name + ' second attempt';
        try {
          await this.tapService.init(connectionProtocol, device);
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
      if (error) {
        this.showError(error);
      }
    }
    loader.dismiss();
    this.changeDetector.detectChanges();
  }

  clear() {
    this.deviceArraySubscription.unsubscribe();
    this.deviceArraySubscribe();
  }

  refreshDevices(event?: any) {
    console.log("refreshing devices");
    try {

      if (this.comService.isScanning) {
        this.stopScan();
      }
      this.clear();
      this.startScan();
      if (event) {
        event.target.complete();
      }
    } catch (error) {
      if (event) {
        event.target.complete();
      }
      console.error(error);
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    console.error('[HomePage]: ', error);
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
    return this.tapService.isConnected(device);
  }

  nfcPairingSubscribe() {
    this.events.subscribe('NFCPairing', (tag: DiscoveredDeviceType) => {
      console.log('nfcPairingSubscribe');
      if (this.devices.find(el => el.address == tag.address && el.name == tag.name) == undefined) {
        this.devices.unshift(tag);
      }
    });
  }

  beginSession() {
    this.nfc.beginSession(() => console.log("iOS NFC Session is on"));
  }

  ionViewWillLeave() {
    this.stopScan();
  }

  beginNDEFSession() {
    this.nfc.beginNDEFSession();
  }
}
