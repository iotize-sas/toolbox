import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TerminalPage } from './terminal.page';
import { TerminalPageRoutingModule } from './terminal.router.module';
import { TerminalViewPageModule } from './terminal-view/terminal-view.module';
import { TerminalSettingsPageModule } from './terminal-settings/terminal-settings.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TerminalPageRoutingModule,
    TerminalViewPageModule,
    TerminalSettingsPageModule
  ],
  declarations: [TerminalPage]
})
export class TerminalPageModule {}
