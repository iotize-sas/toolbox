import { Component, ChangeDetectorRef } from '@angular/core';
import { IoTizeTap, DiscoveredDeviceType } from 'iotize-ng-com';
import { ToastController } from '@ionic/angular';
import { ComService } from '../../services/com.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(public comService: ComService,
    public tapService: IoTizeTap,
    private toast: ToastController,
    private changeDetector: ChangeDetectorRef) { }

  devices: DiscoveredDeviceType[] = [];

  startScan() {
    this.comService.startScan().subscribe(
      device => {
        console.log(device);
        if (this.devices.findIndex(dev => dev.address == device.address) == -1) {
          this.devices.push(device);
          this.changeDetector.detectChanges();
        }
      });
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
     const connectionProtocol = this.comService.getProtocol(device);
     try {
       await this.tapService.init(connectionProtocol);
       this.changeDetector.detectChanges();
     } catch (error) {
       this.handleError(error);
     }
  }

  async disconnect() {
    await this.tapService.disconnect();
    this.comService.selectedDevice = null;
  }

  clear() {
    if (this.tapService.tap && this.comService.selectedDevice) {
      this.devices.filter(device => this.isConnected(device));
    } else {
      this.devices.splice(0);
    }
    this.tapService.clear();
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
      throw error;
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

  private showError(errorMessage: string) {
    this.toast.create({
      message: errorMessage,
      duration: 0,
      showCloseButton: true
    })
  }

  isConnected(device:DiscoveredDeviceType) {
    if (this.tapService.isReady && this.comService.selectedDevice) {
      return device.address === this.comService.selectedDevice.address
    }
    return false;
  }
}
