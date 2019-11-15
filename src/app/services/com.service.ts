import { Injectable } from '@angular/core';
// import { IoTizeComService, IoTizeBle, DiscoveredDeviceType } from '@iotize/ng-com-services';
import { Observable, Subscription, pipe, from } from 'rxjs';
import { ComProtocol } from '@iotize/device-client.js/protocol/api';
import { Events } from '@ionic/angular';
import { timeout, first, finalize, filter, find, map } from 'rxjs/operators';
import { CordovaInterface, BLEComProtocol, BLEScanner, DiscoveredDeviceType } from '@iotize/cordova-plugin-iotize-ble';

declare var iotizeBLE: CordovaInterface;

export type AvailableCom = "BLE" | "NFC" | "WIFI";

@Injectable({
  providedIn: 'root'
})
export class ComService
// implements IoTizeComService 
{

  private selectedCom: AvailableCom = "BLE";
  private _scanner: BLEScanner

  constructor(public events: Events) {
    this._scanner = new BLEScanner();
  }

  startScan(): void {
    this._scanner.start();
  }
  checkAvailable(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      iotizeBLE.checkAvailable(
        _ => resolve(),
        error => reject(error)
      );
    });
  }

  stopScan(): void | Promise<void> {
    return this._scanner.stop();
  }
  getProtocol(device: DiscoveredDeviceType | string, options?): ComProtocol {
    const protocol = new BLEComProtocol(typeof device == "object"? device.address : device, options);
    return protocol;
  }

  // private getselectedComService(): IoTizeComService {
  //   switch (this.selectedCom) {
  //     case "BLE":
  //       return this.ble;
  //     default:
  //       throw new Error("Specified comService not implemented");
  //   }
  // }

  get isScanning() {
    return this._scanner.isScanning
  }

  devicesArray(): Observable<DiscoveredDeviceType[]> {
    return this._scanner.results
  }
  // clearDevices(): void {
  //   const except = [];
  //   if (!!this.selectedDevice) {
  //     except.push(this.selectedDevice);
  //   }
  //   this.getselectedComService().clearDevices(except);
  // }

  private _scanForSpecificDeviceObservable(deviceNameOrAddress: string, timeOut = 1000) {
    return this._scanner.results.pipe(
      timeout(timeOut),
      find(array => array.find( _ => _.name == deviceNameOrAddress || _.address == deviceNameOrAddress) !== undefined),
      map(array => array.find( _ => _.name == deviceNameOrAddress || _.address == deviceNameOrAddress)),
      finalize(() => this.stopScan())
    )
  }

  async scanForSpecificDevice(deviceName: string, timeOut?: number): Promise<DiscoveredDeviceType> {
    return this._scanForSpecificDeviceObservable(deviceName, timeOut).toPromise();
  }
}
