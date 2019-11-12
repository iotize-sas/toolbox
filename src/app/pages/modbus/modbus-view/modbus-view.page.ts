import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ResultCodeTranslation } from '@iotize/device-client.js/client/api/response';
import { ModbusOptions, VariableFormat } from '@iotize/device-client.js/device/model';
import { ToastOptions } from '@ionic/core';
import { ModbusModalPage } from './modbus-modal/modbus-modal.page';
import { IonContent, ModalController, ToastController, AlertController, IonItemSliding } from '@ionic/angular';
import { ModbusReadAnswer, DataDisplay } from 'src/app/helpers/modbus-helper';
import { LoggerService } from '../../terminal/services/logger.service';
import { Keyboard } from "@ionic-native/keyboard/ngx";
import { ModbusService } from '../services/modbus.service';
import { Subscription } from 'rxjs';
import { ModbusRequestSettingsPage } from './modbus-request-settings/modbus-request-settings.page';

@Component({
  selector: 'app-modbus-view',
  templateUrl: './modbus-view.page.html',
  styleUrls: ['./modbus-view.page.scss'],
})
export class ModbusViewPage implements OnInit {

  @ViewChild(IonContent) content: IonContent;

  data = '';

  constructor(public modbus: ModbusService,
    public logger: LoggerService,
    public changeDetector: ChangeDetectorRef,
    public modalController: ModalController,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    private keyboard: Keyboard) { }

  ngOnInit() {
    console.log('[TerminalViewPage] init');
    if (!this.modbus.settings.didFetchSettings) {
      this.modbus.settings.getUARTSettings();
    }
  }

  async send(data?: number | string) {
    if (data !== undefined) {
      if  (typeof data == 'string') {
        data = Number(data);
      }
      try {
        await this.modbus.sendNumber(data);
      } catch (error) {
        this.showError(error);
      }
    }
  }

  closeKeyboardAndSend(data: number | string) {
    this.keyboard.hide();
    return this.send(data);
  }

  // clear() {
  //   // this.logLines.splice(0);
  // }

  async openSettingsModal() {
    let _this = this;
    const modal = await this.modalController.create({
      component: ModbusModalPage
    });

    modal.onDidDismiss().then(() => {
      _this.changeDetector.detectChanges()
    });

    return await modal.present();
  }

  // formatToStringFactory(displayAs: 'HEX' | 'DEC', format?: VariableFormat) {
  //   if (displayAs === 'DEC') {
  //     return function (val) {
  //       return val;
  //     };
  //   } else {
  //     const _this = this;
  //     if (!format) {
  //       if (this.modbus.lastModbusRead && this.modbus.lastModbusRead.config && this.modbus.lastModbusRead.config.format)
  //       format = this.modbus.lastModbusRead.config.format;
  //     } else {
  //       format = VariableFormat._16_BITS;
  //     }
  //     return function (val) {
  //       return _this.formatToStringClosure(val, format);
  //     };
  //   }
  // }

  // formatToStringClosure(value, format) {
  //   if (format !== 0) {
  //     let result = value.toString(16).toUpperCase();
  //     result = '0000000' + result;
  //     result = '0x' + result.slice(-(2 ** format));
  //     return result;
  //   }
  //   return !!value;
  // }

  async read() {
    try {
      await this.modbus.readLast();
    } catch (error) {
      this.showError(error);
    }
  }

  async showToast(msg: string, duration = 3000) {
    const toastOptions: ToastOptions = { message: msg };
    if (duration === 0) {
      toastOptions.showCloseButton = true;
    } else {
      toastOptions.showCloseButton = true;
      toastOptions.duration = duration;
    }
    (await this.toastCtrl.create(toastOptions)).present();
  }

  canSend() {
    return this.modbus.canSend();
  }

  keepLine(slidingEl?: IonItemSliding) {
    if (slidingEl) {
      slidingEl.closeOpened();
    }
    this.modbus.keepLine();
    this.changeDetector.detectChanges();
  }

  deleteLine(id) {
    this.modbus.delete(id);
    this.changeDetector.detectChanges();
  }

  async refresh(index?: number) {
    try {
      await this.modbus.refresh(index);
    } catch (error) {
      this.showError(error);
    }
  }

  savedModbusTrackFn(index, item) {
    return index;
  }

  showError(error) {
    if (ResultCodeTranslation[error] !== undefined) {
      this.showToast(`Error: device responded ${ResultCodeTranslation[error]}`, 0);
    } else {
      this.showToast(`Error: device responded ${error.message ? error.message : error.toString()}`, 0);
    }
  }

  get displayConverter() {
    return DataDisplay
  }

  toggleMonitoring(index) {
    this.modbus.toggleMonitoring(index);
  }
  async openSettings(index) {
    let _this = this;
    let data = {index: index};
    const modal = await this.modalController.create({
      component: ModbusRequestSettingsPage,
      componentProps: data
    });

    modal.onDidDismiss().then(() => {
      console.log('didDismissed Settings');
      _this.changeDetector.detectChanges()
    });

    return await modal.present();
  }
}