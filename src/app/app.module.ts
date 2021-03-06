import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { IotizeNgComModule } from "@iotize/ng-com-services";
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { NFC } from '@ionic-native/nfc/ngx';
import { AppVersion } from "@ionic-native/app-version/ngx";
import { ComponentsModule } from './components/components.module';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import { SecureStorage } from '@ionic-native/secure-storage/ngx';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IotizeNgComModule,
    ComponentsModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Keyboard,
    NFC,
    Dialogs,
    AppVersion,
    SecureStorage
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
