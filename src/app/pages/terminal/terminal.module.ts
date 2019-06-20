import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TerminalPage } from './terminal.page';
import { TerminalViewPageModule } from './terminal-view/terminal-view.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([{
      path: '',
      component: TerminalPage
    }]),
    TerminalViewPageModule
  ],
  declarations: [TerminalPage]
})
export class TerminalPageModule {}
