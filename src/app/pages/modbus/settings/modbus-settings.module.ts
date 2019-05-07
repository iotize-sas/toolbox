import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ModbusSettingsPage } from './modbus-settings.page';
import { PipeModule } from 'src/app/pipes/pipes.modules';
import { ComponentsModule } from 'src/app/components/components.module';

const routes: Routes = [
  {
    path: '',
    component: ModbusSettingsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PipeModule,
    ComponentsModule
  ],
  declarations: [ModbusSettingsPage]
})
export class ModbusSettingsPageModule {}
