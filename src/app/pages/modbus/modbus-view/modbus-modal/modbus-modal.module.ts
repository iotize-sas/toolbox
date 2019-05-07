import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModbusModalPage } from './modbus-modal.page';
import { PipeModule } from 'src/app/pipes/pipes.modules';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipeModule
  ],
  declarations: [ModbusModalPage],
  entryComponents: [ModbusModalPage]
})
export class ModbusModalPageModule {}
