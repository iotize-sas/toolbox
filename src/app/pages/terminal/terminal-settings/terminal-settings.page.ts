import { SettingsService } from '../services/settings.service';
import { Component, ChangeDetectorRef } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { TerminalService } from '../services/terminal.service';
import { UartSettings } from '@iotize/device-client.js/device/model';
import { ResultCodeTranslation } from '@iotize/device-client.js/client/api/response';

@Component({
  selector: 'terminal-settings',
  templateUrl: 'terminal-settings.page.html',
  styleUrls: ['terminal-settings.page.scss']
})
export class TerminalSettingsPage {

  constructor(public settings: SettingsService,
    public terminal: TerminalService,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public changeDetector: ChangeDetectorRef,
    public toastController: ToastController) { }

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
      console.log('apply changes ended, launching reading task');
    } catch (error) {
      loader.dismiss();
      this.showToast(error);
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
      await this.showToast(`ERROR : ${error}`);
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

  async testSetUART() {
    try {
      await this.settings.tapService.tap.service.target.disconnect();
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
            handler: async () => {
              const response = await this.settings.tapService.tap.service.target.setUARTSettings(this.settings._settings);

              console.log('apply changes ended, launching reading task');
              if (response.isSuccess()) {
                console.log('>>>>>>> connecting');
                await this.settings.tapService.tap.service.target.connect();
                return;
              } else {
                throw new Error('setUARTSettings response failed: ' + ResultCodeTranslation[response.codeRet()]);
              }
            }
          },
        ]
      });
      await confirm.present();

    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async openLoginAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Login',
      inputs: [
        {
          name: 'username',
          type: 'text',
          placeholder: 'Username'
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => { }
        },
        {
          text: 'Ok',
          handler: async (data) => {
            alert.dismiss();
            const username = data['username'];
            const password = data['password'];
            await this.login(username, password);
            this.changeDetector.detectChanges();
          }
        }
      ]
    });
    alert.present();
  }

  async login(username: string, password: string) {
    const loader = await this.loadingCtrl.create({ message: 'Logging in' });
    loader.present();

    try {
      const logSuccess = await this.terminal.login(username, password);
      loader.dismiss();
      if (logSuccess) {
        this.showToast(`Logged in as ${username}`);
      } else {
        this.showToast(`Wrong username or password`);
      }

    } catch (error) {
      loader.dismiss();
      console.error(error);
      this.showClosingToast(`Login error : ${error}`);
    }

  }

  async openLogoutAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Logout',
      message: 'Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => { }
        },
        {
          text: 'Yes',
          handler: () => {
            alert.dismiss();
            this.logout();
          }
        }
      ]
    });
    alert.present();
  }

  async logout() {
    const loader = await this.loadingCtrl.create({ message: 'Logging out' });
    loader.present();

    try {
      const logSuccess = await this.terminal.logout();
      loader.dismiss();
      if (logSuccess) {
        this.showToast(`Logged out`);
      } else {
        this.showToast(`Could not log out`);
      }

    } catch (error) {
      loader.dismiss();
      console.error(error);
      this.showClosingToast(`Logout error : ${error}`);
    }
  }

  get isLogged(): boolean {
    if (this.terminal.tapService.session) {
      return this.terminal.tapService.session.name !== 'anonymous';
    }
    return false;
  }
}
