import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModbusPage } from './modbus.page';

const routes: Routes = [
  {
    path: '',
    component: ModbusPage,
    children: [
      {
        path: '',
        redirectTo: 'modbus',
        pathMatch: 'full',
      },
      {
        path: 'modbus',
        children: [
          {
            path: '',
            loadChildren: './modbus-view/modbus-view.module#ModbusViewPageModule'
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadChildren: './settings/modbus-settings.module#ModbusSettingsPageModule'
          }
        ]
      }
    ]
  }
//   ,
//   {
//     path: '',
//     redirectTo: '/tabs/home',
//     pathMatch: 'full'
//   }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModbusPageRoutingModule { }
