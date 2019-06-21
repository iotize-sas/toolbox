import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModbusPage } from './modbus.page';
import { ModbusViewPageModule } from './modbus-view/modbus-view.module';
import { ModbusModalPageModule } from './modbus-view/modbus-modal/modbus-modal.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([{
      path: '',
      component: ModbusPage
    }]),
    ModbusViewPageModule,
    ModbusModalPageModule
  ],
  declarations: [ModbusPage]
})
export class ModbusPageModule {}
