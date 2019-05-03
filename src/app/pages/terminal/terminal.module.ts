import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TerminalPage } from './terminal.page';
import { TerminalPageRoutingModule } from './terminal.router.module';
import { TerminalViewPageModule } from './terminal-view/terminal-view.module';
import { SettingsPageModule } from './settings/settings.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TerminalPageRoutingModule,
    TerminalViewPageModule,
    SettingsPageModule
  ],
  declarations: [TerminalPage]
})
export class TerminalPageModule {}
