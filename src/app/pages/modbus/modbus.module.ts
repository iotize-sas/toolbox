import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModbusPage } from './modbus.page';
import { ModbusPageRoutingModule } from './modbus.router.module';
import { ModbusViewPageModule } from './modbus-view/modbus-view.module';
import { ModbusSettingsPageModule } from './settings/settings.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModbusPageRoutingModule,
    ModbusViewPageModule,
    ModbusSettingsPageModule
  ],
  declarations: [ModbusPage]
})
export class ModbusPageModule {}
