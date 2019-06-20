import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SettingsPage } from './settings.page';
import { PipeModule } from 'src/app/pipes/pipes.modules';
import { SettingsGuard } from 'src/app/settings.guard';

const routes: Routes = [
  {
    path: '',
    component: SettingsPage,
    canDeactivate: [SettingsGuard]
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
  providers: [SettingsGuard],
  declarations: [SettingsPage]
})
export class SettingsPageModule {}
