import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { ModbusOptions, VariableFormat } from '@iotize/device-client.js/device/model';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ModbusService } from '../../services/modbus.service';
import { DataDisplay, DisplayOptions } from 'src/app/helpers/modbus-helper';

@Component({
  selector: 'app-modbus-modal',
  templateUrl: './modbus-modal.page.html',
  styleUrls: ['./modbus-modal.page.scss'],
})
export class ModbusModalPage {

  constructor(public modbus: ModbusService,
    public modal: ModalController,
    private keyboard: Keyboard) { }

  isRegisterValidHexString = true;

  get dataLength() {
    return this.modbus.displayedModbusOptions.length;
  }

  set dataLength(val: any) {
    console.log(`Trying to set dataLength to ${val}`);
    this.modbus.displayedModbusOptions.length = val !== null ? val : 1;
    //val is Number formatted or undefined. sets a default value
  }

  get objectType() {
    return this.modbus.displayedModbusOptions.objectType.toString();
  }

  set objectType(val: string) {
    // console.log(`Setting objectType with ${val} <=> ${ModbusOptions.ObjectType[val]}`);
    this.modbus.displayedModbusOptions.objectType = Number(val);
    this.modbus.displayedModbusOptions.format = this.modbus.displayedModbusOptions.objectType === ModbusOptions.ObjectType.COIL ||
      this.modbus.displayedModbusOptions.objectType === ModbusOptions.ObjectType.DISCRET_INPUT ?
      VariableFormat._1_BIT : VariableFormat._16_BITS;
  }

  get format() {
    return this.modbus.displayedModbusOptions.format.toString();
  }

  set format(val: string) {
    this.modbus.displayedModbusOptions.format = +val;
  }

  get address() {
    return this.modbus.displayedModbusOptions.address
  }
  set address(val: number) {
    this.modbus.displayedModbusOptions.address = val;
  }

  get slave() {
    return this.modbus.displayedModbusOptions.slave
  }
  set slave(val: number) {
    this.modbus.displayedModbusOptions.slave = val;
  }

  get displayMode(){
    const display = this.modbus.displayedModbusOptions.displayOptions.displayAs
    return display.toString();
  }
  set displayMode(val){
    this.modbus.displayedModbusOptions.displayOptions.displayAs = +val
  }

  dismiss() {
    this.modal.dismiss();
  }
  get ModbusOptions() {
    return ModbusOptions;
  }
  get DataDisplay() {
    return DataDisplay;
  }

  get VariableFormat() {
    return VariableFormat;
  }

  get canChangeFormat() {
    return this.modbus.displayedModbusOptions.objectType !== ModbusOptions.ObjectType.COIL && this.modbus.displayedModbusOptions.objectType !== ModbusOptions.ObjectType.DISCRET_INPUT;
  }

  get hexAddress() {
    return this.modbus.displayedModbusOptions.address.toString(16).toUpperCase();
  }

  set hexAddress(value: string) {
    const regExpHexString = /^([A-Fa-f0-9])+$/;
    if (value == '') {
      value = '0'
    }
    if (regExpHexString.test(value)) {
      this.isRegisterValidHexString = true;
      this.modbus.displayedModbusOptions.address = + ('0x' + value);
    } else {
      this.isRegisterValidHexString = false;
    }
  }

  saveOptions() {
    this.modbus.saveOptions();
  }
  restoreOptions() {
    this.modbus.restoreOptions();
  }

  saveAndDismiss() {
    this.saveOptions();
    this.dismiss();
  }
  
  cancelAndDismiss() {
    this.restoreOptions();
    this.dismiss();
  }

  closeKeyboard() {
    this.keyboard.hide();
  }
}
