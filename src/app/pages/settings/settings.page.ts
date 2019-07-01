import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { AlertController, LoadingController, ToastController, Events } from '@ionic/angular';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { UartSettings } from '@iotize/device-client.js/device/model';
import { resolve } from 'q';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(public settings: SettingsService,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public changeDetector: ChangeDetectorRef,
    public toastController: ToastController,
    private keyboard: Keyboard,
    public events: Events) { }

    ngOnInit() {
      this.events.subscribe('needChangeDetection', () => this.changeDetector.detectChanges());
    }

    ionViewWillEnter() {
      if (!this.settings.didFetchSettings) {
        this.readSettingsFromTap();
      }
    }

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
      if (!this.settings.tapService.tap) {
        throw new Error('Not connected');
      }
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

  async autoBaudRate() {
    const confirm = await this.alertCtrl.create({
      header: 'AutoBaud',
      message: 'Do you want to scan for correct baudrate? (this option only works in Modbus)',
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
            this.detectBaudRate();
          }
        },
      ]
    });
    await confirm.present();
  }

  async detectBaudRate() {
    const loader = await this.loadingCtrl.create(
      {
        message: 'Searching for baudrate on ' + this.UartSettings[this.settings.settings.physicalPort],
        backdropDismiss: true
      }
    );
    loader.onDidDismiss().then(() => this.settings.stopAutoBaud = true);
    loader.present();
    try {
      const validatedSettings = await this.settings.autoDetectBaudRate();
      console.log(validatedSettings);
      loader.dismiss();
      this.showClosingToast(`Found modbus settings`);
      this.changeDetector.detectChanges(); //force view update
    } catch (error) {
      loader.dismiss();
      this.showClosingToast(`${error.message ? error.message : error}`);
    }
  }


}
