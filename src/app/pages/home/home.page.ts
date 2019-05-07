import { Component, ChangeDetectorRef } from '@angular/core';
import { IoTizeTap, DiscoveredDeviceType } from 'iotize-ng-com';
import { ToastController, LoadingController } from '@ionic/angular';
import { ComService } from '../../services/com.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(public comService: ComService,
    public tapService: IoTizeTap,
    private toast: ToastController,
    private changeDetector: ChangeDetectorRef,
    public loadingCtrl: LoadingController) {
      this.deviceArraySubscribe();
    }

  devices: DiscoveredDeviceType[] = [];
  private deviceArraySubscription: Subscription;
  private deviceArraySubscribe() {
    this.deviceArraySubscription = this.comService.devicesArray().subscribe(arr => this.devices = arr);
  }
  startScan() {
    this.comService.startScan().subscribe({error: err => this.handleError(err)});
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
       this.showToast('Connected to ' + device.name);
       this.changeDetector.detectChanges();
     } catch (error) {
       loader.dismiss();
       this.handleError(error);
     }
  }

  async disconnect() {
    await this.tapService.disconnect();
    this.comService.selectedDevice = null;
  }

  clear() {
    this.deviceArraySubscription.unsubscribe();
    this.comService.clearDevices();
    this.deviceArraySubscribe();
    // this.tapService.clear();
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
    } catch(error) {
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

  isConnected(device:DiscoveredDeviceType) {
    let isConnected = false;
    if (this.tapService.isReady && this.comService.selectedDevice) {
      isConnected = device.address == this.comService.selectedDevice.address
    }
    console.log(`Device ${device.name} is ${!isConnected? 'not':''} connected`);
    console.log(`Device address: ${device.address}`)
    console.log(`ConnectedDevice address: ${this.comService.selectedDevice? this.comService.selectedDevice.address : 'no device connected'}`)
    console.log(`is tap ready? ${this.tapService.isReady}`);
    return isConnected;
  }
}
