import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ModbusSettingsService } from '../services/modbus-settings.service';
import { ModbusService } from '../services/modbus.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { UartSettings } from '@iotize/device-client.js/device/model';

@Component({
  selector: 'app-modbus-settings',
  templateUrl: './modbus-settings.page.html',
  styleUrls: ['./modbus-settings.page.scss'],
})
export class ModbusSettingsPage {

  constructor(public settings: ModbusSettingsService,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public changeDetector: ChangeDetectorRef,
    public toastController: ToastController,
    private keyboard: Keyboard) { }

  get UartSettings() {
    return UartSettings;
  }

  async changeSettings() {
    console.log('change settings');
    if (this.settings.settingsHasChanged()) {
      const confirm = await this.alertCtrl.create({
        header: 'Apply new settings',
        message: 'Are you sure?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
            }
          },
          {
            text: 'Yes',
            handler: () => {
              this.applyChanges();
            }
          },
        ]
      });
      await confirm.present();
    }
  }

  async applyChanges() {
    const loader = await this.loadingCtrl.create( {message: 'Applying new settings'});
    loader.present();
    try {
      await this.settings.applyChanges();
      loader.dismiss();
    } catch (error) {
      loader.dismiss();
      this.showClosingToast(error.message);
    }
  }
  async readSettingsFromTap() {
    const loader = await this.loadingCtrl.create( {message: 'Reading settings from tap'});
    loader.present();
    try {
      await this.settings.getUARTSettings();
      loader.dismiss();
    } catch (error) {
      loader.dismiss();
      console.error(error);
      await this.showToast(`${error}`);
    }
  }

  async showToast(message: string, duration: number = 3000): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: duration
    });

    toast.present();
  }

  async showClosingToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      showCloseButton: true,
    });

    toast.present();
  }

  closeKeyboard() {
    this.keyboard.hide();
  }

  async detectBaudRate() {
    try {

      const validatedSettings = await this.settings.autoDetectBaudRate();
      console.log(validatedSettings);
      this.showClosingToast(`Found modbus settings`);
    } catch (error) {
      this.showClosingToast(`${error.message? error.message : error}`);
    }
  }
}
