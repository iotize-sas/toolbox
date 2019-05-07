import { FormatHelper } from '@iotize/device-client.js/core';
import { SettingsService } from './settings.service';
import { LoggerService } from './logger.service';
import { Injectable } from '@angular/core';
import { interval, Observable, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { ResultCodeTranslation, ResultCode, Response } from '@iotize/device-client.js/client/api/response';
import { IoTizeTap } from 'iotize-ng-com';
import { Events } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class TerminalService {

  readingTaskOn = false;
  private readingData = false;
  private refreshTime = 500;
  dataType: 'ASCII' | 'HEX' = 'ASCII';
  endOfLine: Array<'CR' | 'LF'> = ['CR'];
  timer: Observable<number> = null;
  readingTaskSubscription: Subscription = null;
  input = '';

  constructor(public logger: LoggerService,
    public tapService: IoTizeTap,
    public settings: SettingsService,
    public events: Events) {
  }

  async send(data: Uint8Array) {
    try {
      if (!this.tapService.isReady) {
        this.events.publish('disconnected');
        return;
      }
      const response = (await this.tapService.tap.service.target.send(data));
      if (response.isSuccess()) {
        if (response.body().byteLength === 0) {
          this.logger.log('info', 'sent: ');
          await this.readAllTargetData();
          return; 
        }
      } else {
        this.handleIoTizeErrors(response);
      }
    } catch (error) {
      if (error.message) {
        this.logger.log('error', error.message);
      } else {
        this.logger.log('error', error);
      }
    }
  }

  sendInput() {
    if (!!this.input) {
      this.sendString(this.input);
    }
  }

  sendString(textToSend: string) {

    let data: Uint8Array;
    let suffix = '';

    for (const end of this.endOfLine) {
      if (end === 'CR') {
        suffix += '\r';
      }
      if (end === 'LF') {
        suffix += '\n';
      }
    }
    switch (this.dataType) {
      case 'HEX':
        data = FormatHelper.hexStringToBuffer(textToSend);
        break;
      case 'ASCII':
        data = FormatHelper.toByteBuffer(textToSend + suffix);
        break;
    }
    console.log(`sending: ${textToSend + suffix}`);
    this.send(data);
  }

  async readAllTargetData() {
    this.readingData = true;
    try {
      const response = (await this.tapService.tap.service.target.readBytes());
      if (response.isSuccessful()) {
        let responseBody = response.body();
        if (responseBody.byteLength > 0) {
          let responseString = '';
          if (this.dataType === 'ASCII') {
            responseString = FormatHelper.toAsciiString(responseBody);
          } else if (this.dataType === 'HEX') {
            responseString = FormatHelper.toHexString(responseBody);
          }
          this.logger.log('info', responseString);
          await this.readAllTargetData();
        } else {
          this.readingData = false;
        }
        return;
      } else {
        this.handleIoTizeErrors(response);
      }
    } catch (error) {
      this.readingData = false;
      if (error.message) {
        this.logger.log('error', error.message);
      } else {
        this.logger.log('error', error);
      }
    }
  }

  launchReadingTask() {
    this.readingTaskOn = true;
    console.log('creating reading task observable');
    this.timer = interval(this.refreshTime).pipe(takeWhile(() => this.readingTaskOn));
    this.readingTaskSubscription = this.timer.subscribe(() => {
      if (!this.readingData) {
        this.readAllTargetData();
      }
    }, err => console.error(err),
      () => console.log('Timer completed'));
  }

  stopReadingTask() {
    this.readingTaskOn = false;
  }

  async handleIoTizeErrors(response: Response<any>) {
    switch (response.codeRet()) {
      case ResultCode.IOTIZE_401_UNAUTHORIZED:
        await this.tapService.sessionState().toPromise();
        this.logger.log('error', `${this.tapService.session.name} is not authorized`);
        break;
      default:
        this.logger.log('error', `Device responded ${ResultCodeTranslation[response.codeRet()]}`);
    }
  }

  async login(username: string, password: string) {
    const didLog = await this.tapService.login(username, password);
    if (didLog) {
      this.events.publish('logged-in');
    }
    return didLog;
  }

  async logout() {
    const didLogout = await this.tapService.logout();
    this.events.publish('logged-out');
    return didLogout;
  }
}
