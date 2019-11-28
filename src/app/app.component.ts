import { Component } from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import { NfcService } from './services/nfc.service';
import { Subscription } from 'rxjs';
import { TapService } from './services/tap.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'Terminal',
      url: '/terminal',
      icon: 'code-working'
    },
    {
      title: 'Modbus',
      url: '/modbus',
      icon: 'swap'
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: 'settings'
    },
    {
      title: 'Infos',
      url: '/infos',
      icon: 'information-circle'
    }
  ];

  private backButtonSubscription: Subscription;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private dialogs: Dialogs,
    private navController: NavController,
    public nfc: NfcService,
    public tapService: TapService
  ) {
    this.initializeApp();
  }
  
  private initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.splashScreen.hide();
      this.nfc.listenNFC(); // iOS tweak
      this.tapService.initSecureStorage();
      if (this.platform.is('android')) {
        this.setAndroidBackButtonBehavior();
      }
      if (this.platform.is('ios')) {
        this.nfc.updateAvailability();
      }
    });
  }

  private exitApp() {
    if (this.platform.is('cordova')) {
      this.tapService.disconnect();
      navigator['app'].exitApp();
    }
  }

  private setAndroidBackButtonBehavior(): void {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(9999, () => {
      console.log('Back button on ', window.location);
      if (window.location.pathname.startsWith('/home')) {
        this.dialogs.confirm('Are you sure you want to quit?', 'Quit Toolbox', [
          'Quit',
          'Cancel'
        ]).then(async (choice:number) => {
          switch (choice) {
            case 1:
              this.tapService.exit();
              this.exitApp();
              break;
            case 0:
            default:
          }
        })
      } else {
        this.navController.back();
      }
    });
  }
}
