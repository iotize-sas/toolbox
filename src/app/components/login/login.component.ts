import { Component, ChangeDetectorRef, Input, OnInit, OnDestroy } from '@angular/core';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { TapService } from 'src/app/services/tap.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy{

  ngOnInit() {
    this.sessionSubscription = this.tapService.sessionState().subscribe(val => this.isLogged = val.name !== 'anonymous');
  }

  ngOnDestroy(){
    this.sessionSubscription.unsubscribe();
    this.sessionSubscription = null;
  }

  @Input() displayText: boolean;

  isLogged = false;
  private sessionSubscription: Subscription;

  constructor(public toastController: ToastController,
              public alertCtrl: AlertController,
              public tapService: TapService,
              public changeDetector: ChangeDetectorRef,
              public loadingCtrl: LoadingController) { }

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
            await this.login(data['username'], data['password']);
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
      const logSuccess = await this.tapService.login(username, password);
      loader.dismiss();
      if (logSuccess) {
        this.showToast(`Logged in as ${username}`);
      } else {
        this.showToast(`Wrong username or password`);
      }

    } catch (error) {
      loader.dismiss();
      console.error(error);
      this.showClosingToast(`Login error : ${error.message? error.message: error}`);
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
      const logSuccess = await this.tapService.logout();
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
}
