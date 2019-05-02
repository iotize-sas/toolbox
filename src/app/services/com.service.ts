import { Injectable } from '@angular/core';
import { IoTizeComService, IoTizeBle, DiscoveredDeviceType } from 'iotize-ng-com';
import { Observable } from 'rxjs';
import { ComProtocol } from '@iotize/device-client.js/protocol/api';

export type AvailableCom = "BLE" | "NFC" | "WIFI";

@Injectable({
  providedIn: 'root'
})
export class ComService implements IoTizeComService {

  private selectedCom: AvailableCom = "BLE";
  public  selectedDevice?: DiscoveredDeviceType;
  
  constructor(private ble: IoTizeBle) { }
  
  startScan(): Observable<DiscoveredDeviceType> {
    return this.getselectedComService().startScan();
  }
  checkAvailable(): Promise<void> {
    return this.getselectedComService().checkAvailable();
  }
  stopScan(): void | Promise<void> {
    return this.getselectedComService().stopScan();
  }
  getProtocol(device: any): ComProtocol {
    if (device.name) {
      this.selectedDevice = device as DiscoveredDeviceType;
    }
    return this.getselectedComService().getProtocol(device);
  }

  private getselectedComService(): IoTizeComService {
    switch(this.selectedCom) {
      case "BLE":
        return this.ble;
      default:
        throw new Error("Specified comService not implemented");
    }
  }

  get isScanning() {
    let isScanning: boolean = false;
    switch (this.selectedCom) {
      case "BLE":
        isScanning = this.ble.isScanning;
        break;
    }
    return isScanning;
  } 

}
