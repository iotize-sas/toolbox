import { Component } from '@angular/core';
import { IoTizeBle, IoTizeTap, DiscoveredDeviceType } from 'iotize-ng-com';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(public ble: IoTizeBle,
    public tapService: IoTizeTap,
    private toast: ToastController) { }

  devices: DiscoveredDeviceType[] = [];

  startScan() {
    this.ble.startScan().subscribe(
      device => {
        console.log(device);
        if (this.devices.findIndex(dev => dev.address == device.address) == -1) {
          this.devices.push(device);
        }
      });
  }

  stopScan() {
    this.ble.stopScan();
  }

  async connect(device: DiscoveredDeviceType) {
     const connectionProtocol = this.ble.getProtocol(device);
     try {
       await this.tapService.init(connectionProtocol);
     } catch (error) {
       this.handleError(error);
     }
  }

  disconnect() {
    return this.tapService.disconnect();
  }

  clear() {
    if (this.tapService.tap) {
      // this.devices.filter(device => device.address === this.)
    } else {
      this.devices.splice(0);
    }
    this.tapService.clear();
  }
  
  refreshDevices() {
    console.log("refreshing devices");
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

  private showError(errorMessage: string) {
    this.toast.create({
      message: errorMessage,
      duration: 0,
      showCloseButton: true
    })
  }
}
