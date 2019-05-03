import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TerminalViewPage } from './terminal-view.page';
import { TerminalModalPageModule } from './terminal-modal/terminal-modal.module';

const routes: Routes = [
  {
    path: '',
    component: TerminalViewPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TerminalModalPageModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TerminalViewPage]
})
export class TerminalViewPageModule {}
