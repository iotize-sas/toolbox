import { Injectable } from '@angular/core';
import { IoTizeTap } from '@iotize/ng-com-services';
import { ComProtocol, ConnectionState } from '@iotize/device-client.js/protocol/api';
import { NFCComProtocol } from '@iotize/device-com-nfc.cordova';
import { DiscoveredDeviceType } from '@iotize/cordova-plugin-iotize-ble';
import { Events, LoadingController, ToastController, Platform } from '@ionic/angular';
import { NFCTag } from './nfc.service';
import { ComService } from './com.service';
import { Subscription, timer, BehaviorSubject } from 'rxjs';
import { SecureStorage, SecureStorageObject } from '@ionic-native/secure-storage/ngx';

@Injectable({
  providedIn: 'root'
})
export class TapService {
  get session() {
    return this.iotizeTap.session;
  };
  sessionState() {
    return this.iotizeTap.sessionState();
  }
  sessionStateForceUpdate() {
    return this.iotizeTap.sessionStateForceUpdate();
  }

  private _selectedDevice?: DiscoveredDeviceType;
  private _secureStore?: SecureStorageObject;
  private _isReconnecting = false;
  private _keepAlivePending = false;
  private _reconnectionSubscription?: Subscription;

  public didReconnect = false;

  constructor(public iotizeTap: IoTizeTap,
    public events: Events,
    public loading: LoadingController,
    public toast: ToastController,
    public platform: Platform,
    public com: ComService,
    private secureStorage: SecureStorage) {

    this._connectionState$ = new BehaviorSubject(ConnectionState.DISCONNECTED);
    // Save the currently connected tap on NFC Pairing
    this.events.subscribe('NFCPairing', (tag: DiscoveredDeviceType) => this._selectedDevice = tag);
    // Allow new connection if a TAP has been discovered and no tap is connected
    this.events.subscribe('tag-discovered', (tag: NFCTag) => {
      if (!this.tap || !this.tap.isConnected() || !this.isReady || this._selectedDevice.name == tag.appName) { // if this is the same tap, 
        this.NFCLoginAndBLEPairing(tag);
      }
    });

    this._handleAppClosing();
  }

  get tap() {
    return this.iotizeTap.tap;
  }

  async init(comProtocol: ComProtocol, _selectedDevice?: DiscoveredDeviceType, nfcPairing = false) {
    try {
      this.didReconnect = false;
      await this.iotizeTap.init(comProtocol);
      this.handleUnexpectedDisconnection();
    } catch (err) {
      //retry
      try {
        await this.iotizeTap.init(comProtocol);
      } catch (err) {
        console.error("[TapService]: init failed");
        console.error(err);
        throw err;
      }
    }
    // Disconnect from target, check for current protocol and connect if Modbus or Serial is available
    // try {
    //   const response = await this.tap.service.target.disconnect();
    //   if (!response.isSuccessful()) {
    //     this.disconnect();
    //     throw new Error(ResultCodeTranslation[response.codeRet()]);
    //   }
    // } catch (err) {
    //   console.error('[TapService] ', err.message? err.message: err);
    //   return this.disconnect();
    // // throw err;
    // }
    // const protocol = (await this.tap.service.target.getProtocol()).body();
    // if (protocol !== TargetProtocol.MODBUS && protocol !== TargetProtocol.SERIAL_STANDARD && protocol !== TargetProtocol.SERIAL_VIA_TAPNPASS) {
    //   await this.disconnect();
    //   throw new Error("Tap is not configured for serial or modbus communication");
    // }
    // await this.tap.service.target.connect();
    if (_selectedDevice) {
      this._selectedDevice = _selectedDevice
    }

    if (!nfcPairing) { // if init is called while nfc pairing, launch keep alive and sync connection state after switching to BLE
      this.initConnectionStateObservable();
      this.keepAliveRoutine();
    }
  }

  async disconnect() {
    this.didReconnect = false;
    if (this._reconnectionSubscription) {
      this._reconnectionSubscription.unsubscribe();

    }
    if (this._keepAliveSubscription) {
      this._keepAliveSubscription.unsubscribe(); // stops keepAlive periodic polling
    }
    if (this._connectionStateSubscription) {
      this._connectionStateSubscription.unsubscribe();
    }
    if (this.tap) {
      try {
        await this.tap.disconnect();
        this.deleteCredentials();
      } catch (err) {
        console.error(err);
      }
    }
    this._selectedDevice = null;
    if (this._connectionState$.value != ConnectionState.DISCONNECTED)
      this._connectionState$.next(ConnectionState.DISCONNECTED);
  }

  get isReady() {
    return this.iotizeTap.isReady;
  }

  get isIOS() {
    return this.platform.is('ios');
  }

  login(user: string, password: string) {
    return this.iotizeTap.login(user, password).then(status => {
      this.events.publish('logged-in');
      if (status) {
        this.storeCredentials(user, password);
      }
      return status;
    });
  }

  logout() {
    this.deleteCredentials();
    return this.iotizeTap.logout();
  }

  async NFCLoginAndBLEPairing(tag: NFCTag) {
    const loader = await this.loading.create({
      message: `Connecting to ${tag.appName}`
    });

    loader.present();

    const discoveredDevice: DiscoveredDeviceType = {
      name: tag.appName,
      address: tag.macAddress
    };

    const bleOptions = {
      connect: {
        timeout: 2000
      },
      disconnect: {
        timeout: 2000
      },
      send: {
        timeout: 2000
      }
    };

    try {
      //start a communication session in NFC
      let nfcProtocol: ComProtocol;
      if (this.isIOS) {
        nfcProtocol = NFCComProtocol.iOSProtocol();
      } else {
        nfcProtocol = new NFCComProtocol();
      }
      await this.init(nfcProtocol, undefined, true);

      //NFC Pairing

      await this.tap.nfcPairing();

      //enable encryption (and NFC auto login if available)
      await this.tap.encryption(true, true);


      //check the user login
      // let sessionState: SessionState = await this.tap.refreshSessionState();
      // const nfcSessionStateString =  JSON.stringify(sessionState);
      // console.log(`NFCLoginAndBLEPairing in NFC:  ` + nfcSessionStateString);

      // loader.message = `Logged as ${sessionState.name}, switching to BLE`;


      let realDevice;
      //connect to the device in BLE
      if (this.isIOS) {
        realDevice = await this.com.scanForSpecificDevice(discoveredDevice.name);
      } else {
        realDevice = discoveredDevice;
      }

      let bleCom: ComProtocol = this.com.getProtocol(realDevice.address, bleOptions);
      //start the BLE communication with the device
      await this.tap.useComProtocol(bleCom).connect();

      if (this.isIOS) {
        console.log('Close NFC Session');
        nfcProtocol.disconnect(); // End NFC reading session
      }

      this.initConnectionStateObservable();
      this.keepAliveRoutine();

      //check the connection
      // sessionState = await this.tap.refreshSessionState();
      // const bleSessionStateString = JSON.stringify(sessionState);
      // console.log(`NFCLoginAndBLEPairing in BLE:  `+ bleSessionStateString);

      this.events.publish('NFCPairing', realDevice);
      loader.dismiss();
    } catch (err) {
      this.iotizeTap.isReady = false;
      console.error("Can't connect to TAP, try again" + JSON.stringify(err));
      try {
        console.log('tryig to connect directly through BLE');

        let realDevice;
        //connect to the device in BLE
        if (this.isIOS) {
          realDevice = await this.com.scanForSpecificDevice(discoveredDevice.name);
        } else {
          realDevice = discoveredDevice;
        }

        let bleCom: ComProtocol = this.com.getProtocol(realDevice, bleOptions);
        //start the BLE communication with the device
        await this.init(bleCom);
        this.events.publish('NFCPairing', realDevice);
        loader.dismiss();
        return;
      } catch (error) {
        console.error('BLE only try failed');
        err = error;
      }
      // this.events.publish('closeNFC');
      console.error(err);
      loader.dismiss();
      const toast = await this.toast.create({ message: "Can't connect to TAP, try again", position: "middle", showCloseButton: true });
      toast.present();
      throw err;
    }

  }

  isConnected(device: DiscoveredDeviceType) {
    let isConnected = false;
    if (this.tap && this.tap.isConnected() && this._selectedDevice) {
      isConnected = device.address == this._selectedDevice.address
    }
    return isConnected;
  }

  private _keepAliveSubscription?: Subscription;
  keepAliveRoutine(period: number = 1000) {
    this._keepAlivePending = false;
    if (this._keepAliveSubscription) {
      this._keepAliveSubscription.unsubscribe();
    }
    this._keepAliveSubscription = timer(0, period).subscribe(
      async () => {
        if (this.tap.isConnected() && !this._keepAlivePending && !this._isReconnecting) {
          this._keepAlivePending = true;
          try {
            await this.tap.service.interface.keepAlive();
          } catch (error) {
            console.error('Keep Alive', error);
          }
          this._keepAlivePending = false;
        }
      }
    )
  }

  private async _reconnect() {
    const loader = await this.loading.create({
      message: 'Connection lost. Reconnecting...'
    });
    loader.present();
    console.warn('RECONNECTING');
    this._isReconnecting = true;
    try {
      await this.tap.connect();
      this.didReconnect = true;
      // disable encrypted communication and reset sessionKey and IV app-side (destroyed Tap-side) 
      await this.tap.logout();
      await this.loginFromStorage();
    } catch (error) {
      console.warn('Could not reconnect to the tap');
      console.warn(error);
    }
    this._isReconnecting = false;
    loader.dismiss();
  }

  private _handleAppClosing() {
    window.addEventListener('beforeunload', () => {
      if (this._selectedDevice) {
        console.log('disconnecting from', this._selectedDevice.name);
        this.disconnect();
      }
    });
  }

  get connectionState() {
    return this._connectionState$.asObservable();
  }

  private _connectionState$: BehaviorSubject<ConnectionState>
  private _connectionStateSubscription

  private initConnectionStateObservable() {
    if (this._connectionStateSubscription) {
      this._connectionStateSubscription.unsubscribe();
    }
    if (this.tap.protocol) {
      this._connectionState$.next(this.tap.protocol.getConnectionState());
      this._connectionStateSubscription = this.tap.protocol.onConnectionStateChange().subscribe(
        event => this._connectionState$.next(event.newState)
      );
    }

  }

  private handleUnexpectedDisconnection() {
    this._reconnectionSubscription = this.connectionState.subscribe(
      state => {
        console.debug(ConnectionState[state]);
        if (state == ConnectionState.DISCONNECTED
          && this._selectedDevice
          && !this._isReconnecting
          && this._keepAliveSubscription) {

          this._reconnect();
        }
      }
    )
  }

  exit() {
    this.disconnect();
  }

  private async storeCredentials(login: string, password: string) {
    if (!this._secureStore) {
      console.log('can not store password: phone is not secured');
      return;
    }
    try {
      await Promise.all(
        [
          this._secureStore.set('login', login),
          this._secureStore.set('password', password)
        ]
      );
      console.log('credentials stored');
    } catch (error) {
      console.debug(error);
    }
  }

  private async deleteCredentials() {
    if (!this._secureStore) {
      console.log('can not store password: phone is not secured');
      return;
    }
    try {
      await Promise.all(
        [
          this._secureStore.remove('login'),
          this._secureStore.remove('password')
        ]
      );
    } catch (error) {
      console.debug(error);
    }
  }

  private async loginFromStorage() {
    if (!this._secureStore) {
      console.log('can not store password: phone is not secured');
      return false;
    }
    try {
      console.log('retrieving credentials from secure storage');
      const login = await this._secureStore.get('login');
      const password = await this._secureStore.get('password');
      return this.login(login, password);
    } catch (err) {
      console.debug(err);
      return false;
    }
  }

  async initSecureStorage() {
    this._secureStore = await this.secureStorage.create('toolbox');
  }
}
