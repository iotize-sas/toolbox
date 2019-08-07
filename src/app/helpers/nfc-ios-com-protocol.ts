//
//  Copyright 2018 IoTize SAS Inc.  Licensed under the MIT license. 
//
//  ble-com-protocol.ts
//  device-com-ble.cordova BLE Cordova Plugin
//

import { QueueComProtocol } from '@iotize/device-client.js/protocol/impl/queue-com-protocol';
import { ComProtocolConnectOptions, ComProtocolDisconnectOptions, ComProtocolSendOptions } from '@iotize/device-client.js/protocol/api/com-protocol.interface';
import { FormatHelper } from '@iotize/device-client.js/core/format/format-helper';
import { from, Observable } from 'rxjs';
import { ConnectionState } from '@iotize/device-client.js/protocol/api';

declare var NFCTapPlugin: any;
export class NFCIosComProtocol extends QueueComProtocol {
    
   constructor() {
       super();
       this.options.connect.timeout = 10000;
   }

    // _connect(options?: ComProtocolConnectOptions): Observable<any> {
    //     return Observable.create((emitter) => {
    //         new Promise( (resolve, reject ) => {
    //          (<any>window).plugins.NFCTapPlugin.beginSession(resolve ,reject);
    //         }).then((res) => {
    //             this.setConnectionState(ConnectionState.CONNECTED);
    //             console.log('JE SUIS LA', res, this.getConnectionState());
    //             emitter.next('OK');
    //             emitter.complete();
    //         })
    //         .catch((err) => {
    //             console.error('Connection error', err);
    //             emitter.error(err);
    //         });
    //     });
    // }

     _connect(options?: ComProtocolConnectOptions): Observable<any> {
    
            let promise = new Promise( (resolve, reject ) => {
             NFCTapPlugin.beginSession(resolve ,reject);
            });
            return from(promise);
        
    }

    _disconnect(options?: ComProtocolDisconnectOptions): Observable<any> {
        let promise =  new Promise( function (resolve, reject ) {
            NFCTapPlugin.endSession(resolve ,reject);
           }).then(() => {
               this.setConnectionState(ConnectionState.DISCONNECTED);
           });
       return from(promise);
    }

    write(data: Uint8Array): Promise<any> {
        throw new Error("Method not implemented.");
    }

    read(): Promise<Uint8Array> {
        throw new Error("Method not implemented.");
    }

    send(data: Uint8Array, options ?: ComProtocolSendOptions): Observable<any>{
        console.log("send data")
        let promise =  new Promise( function (resolve, reject ) {
            NFCTapPlugin.send(FormatHelper.toHexString(data), resolve ,reject);
           }).then((hexString: string) => FormatHelper.hexStringToBuffer(hexString));
       return from(promise);
    }

    

 };

