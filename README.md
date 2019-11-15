# IoTize Toolbox

This is an example of a hybrid project using ionic framework that uses IoTize APIs and plugins to communicate with IoTize devices. 

- User Manual: [http://docs.iotize.com/UserManuals/Toolbox/](http://docs.iotize.com/UserManuals/Toolbox/)

## Requirements

Toolbox is an application based on Ionic, so it requires a proper installation of the framework in order to build the app. It also requires the android and/or iOS build tools. This is explained by the Ionic and Cordova framework documentations:

- [Ionic Framework](https://ionicframework.com/docs/installation/cli)
- [Apache Cordova: Android requirements](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#installing-the-requirements)
- [Apache Cordova: iOS requirements](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/index.html#installing-the-requirements)

## Commands

You may use any of the ionic CLI commands in this project. Some npm scripts also act as shortcuts for these:

```bash
npm run android # build and launch the app on android, in debug mode
npm run android:prod # same but with the "prod" flag
npm run ios # build and launch the app on iOS, in debug mode
npm run ios:prod # same but with the "prod" flag
```

## Plugins

This project also acts as an example for the IoTize cordova plugins, which allow communication between IoTize devices and the appications.

Here are the plugins used by Toolbox:

- [IoTize NFC Plugin](https://github.com/iotize-sas/device-com-nfc.cordova)
- [IoTize BLE Plugin](https://github.com/iotize-sas/cordova-plugin-iotize-ble)

## Development

Toolbox is based on the ionic starter template called "sidemenu" (see [Ionic Templates](https://ionicframework.com/docs/v3/cli/starters.html))