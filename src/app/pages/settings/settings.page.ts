import { Component, ChangeDetectorRef } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { UartSettings } from '@iotize/device-client.js/device/model';
import { resolve } from 'q';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {

  constructor(public settings: SettingsService,
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
    const loader = await this.loadingCtrl.create({ message: 'Applying new settings' });
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
    const loader = await this.loadingCtrl.create({ message: 'Reading settings from tap' });
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

  canDeactivate(): Promise<boolean> | boolean {
    if (this.settings.settingsHasChanged()) {

      return new Promise((resolve) => {
        this.alertCtrl.create({
          message: 'You did not apply the current settings. Do you want to discard changes?',
          buttons: [
            {
              text: 'No',
              role: 'cancel',
              handler: () => {
                resolve(false);
              }
            },
            {
              text: 'Yes',
              handler: () => {
                this.settings.discardChanges();
                resolve(true);
              }
            },
          ]
        }).then(confirm => confirm.present());
      });
    }
    return true;
  }
    

}
