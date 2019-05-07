import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { ModbusOptions, VariableFormat } from '@iotize/device-client.js/device/model';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ModbusService } from '../../services/modbus.service';

@Component({
  selector: 'app-modbus-modal',
  templateUrl: './modbus-modal.page.html',
  styleUrls: ['./modbus-modal.page.scss'],
})
export class ModbusModalPage implements OnInit {

  constructor(public modbus: ModbusService,
              public modal: ModalController,
              private keyboard: Keyboard) { }

  slave: number;
  address: number;
  _objectType: ModbusOptions.ObjectType;
  _format: VariableFormat;
  length: number;
  displayMode: 'HEX' | 'DEC';

  get dataLength() {
    return this.length;
  }

  set dataLength(val: any) {
    console.log(`Trying to set dataLength to ${val}`);
    this.length = val !== null? val : 1;
    //val is Number formatted or undefined. sets a default value
  }

  get objectType() {
    return this._objectType.toString();
  }

  set objectType(val: string) {
    // console.log(`Setting objectType with ${val} <=> ${ModbusOptions.ObjectType[val]}`);
    this._objectType = Number(val);
    this._format = this._objectType === ModbusOptions.ObjectType.COIL || this._objectType === ModbusOptions.ObjectType.DISCRET_INPUT ?
                VariableFormat._1_BIT : VariableFormat._16_BITS;
  }

  get format() {
    return this._format.toString();
  }

  set format(val: string) {
    this._format = Number(val);
  }

  ngOnInit() {
    this.getSavedOptions();
  }
  dismiss() {
    this.modal.dismiss();
  }
  get ModbusOptions() {
    return ModbusOptions;
  }

  get VariableFormat() {
    return VariableFormat;
  }

  get canChangeFormat() {
    return this._objectType !== ModbusOptions.ObjectType.COIL && this._objectType !== ModbusOptions.ObjectType.DISCRET_INPUT;
  }

  getSavedOptions() {
    this.slave = this.modbus.modbusOptions.slave;
    this.address = this.modbus.modbusOptions.address;
    this._objectType = this.modbus.modbusOptions.objectType;
    this._format = this.modbus.modbusOptions.format;
    this.length = this.modbus.modbusOptions.length;
    this.displayMode = this.modbus.displayMode;
  }

  saveOptions() {
    this.modbus.modbusOptions.slave = this.slave;
    this.modbus.modbusOptions.address = this.address;
    this.modbus.modbusOptions.objectType = this._objectType;
    this.modbus.modbusOptions.format = this._format;
    this.modbus.modbusOptions.length = this.length;
    this.modbus.displayMode = this.displayMode;
  }

  saveAndDismiss() {
    this.saveOptions();
    this.dismiss();
  }

  closeKeyboard() {
    this.keyboard.hide();
  }
}
