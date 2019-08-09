import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NfcService } from './services/nfc.service';

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

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public nfc: NfcService
  ) {
    this.initializeApp();
    // this.nfc.listenNFC();
  }
  
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.splashScreen.hide();
      this.nfc.listenNFC(); // iOS tweak
    });
  }
}
