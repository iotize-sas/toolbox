import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { ModbusReadAnswer, DataDisplay, ByteOrder } from 'src/app/helpers/modbus-helper';
import { ModbusService } from '../../services/modbus.service';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { VariableFormat } from '@iotize/device-client.js/device/model';

@Component({
  selector: 'app-modbus-request-settings',
  templateUrl: './modbus-request-settings.page.html',
  styleUrls: ['./modbus-request-settings.page.scss'],
})
export class ModbusRequestSettingsPage {

  constructor(public modbus: ModbusService,
    public modal: ModalController,
    private keyboard: Keyboard,
    private navParams: NavParams) { }

  protected isReady = false;
  private _modbusRead?: ModbusReadAnswer;
  _displayMode?: DataDisplay;
  period?: number;
  _byteOrder?: ByteOrder; 


  ionViewWillEnter() {
    let index = this.navParams.get('index');
    console.log(index);
    this._modbusRead = this.modbus.savedModbusValues.get(index);
    this._displayMode = this._modbusRead.config.displayOptions.displayAs;
    this._byteOrder = this._modbusRead.config.displayOptions.byteOrder;
    this.period = this._modbusRead.config.monitoringPeriod;
    this.isReady = true;
  }

  get DataDisplay() {
    return DataDisplay;
  }

  get ByteOrder() {
    return ByteOrder;
  }

  get displayMode() {
    return this._displayMode.toString();
  }
  set displayMode(val) {
    this._displayMode = +val;
  }

  get byteOrder() {
    return this._byteOrder;
  }
  set byteOrder(val) {
    this._byteOrder;
  }

  get is32bits() {
    return this._modbusRead.config.format == VariableFormat._32_BITS;
  }

  saveAndDismiss() {
    this._modbusRead.config.displayOptions.byteOrder = this._byteOrder;
    this._modbusRead.config.displayOptions.displayAs = this._displayMode;
    this._modbusRead.config.monitoringPeriod = this.period;
    this.modbus.resetMonitoring(this._modbusRead.id);
    this.dismiss();
  }
  dismiss() {
    this.modal.dismiss();
  }

  closeKeyboard() {
    this.keyboard.hide();
  }
}
