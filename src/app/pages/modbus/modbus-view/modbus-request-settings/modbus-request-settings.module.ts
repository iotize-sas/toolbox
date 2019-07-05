import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ModbusRequestSettingsPage } from './modbus-request-settings.page';
import { PipeModule } from 'src/app/pipes/pipes.modules';

const routes: Routes = [
  {
    path: '',
    component: ModbusRequestSettingsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipeModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ModbusRequestSettingsPage]
})
export class ModbusRequestSettingsPageModule {}
