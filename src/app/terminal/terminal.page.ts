import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { TerminalService } from './services/terminal.service';
import { Events, IonTabs } from '@ionic/angular';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.page.html',
  styleUrls: ['./terminal.page.scss'],
})
export class TerminalPage {

  constructor(public terminal: TerminalService,
    public events: Events,
    public changeDetector: ChangeDetectorRef) {
      this.events.subscribe('connected', () => this.changeDetector.detectChanges());
      this.events.subscribe('disconnected', () => this.changeDetector.detectChanges());
  }
  @ViewChild(IonTabs) tabs: IonTabs;

  async tabChanged() {
    console.log('tab changed');
    const label = await this.tabs.getSelected();
    console.log(`selected tab : ${label}`);
    if (label === 'terminal' && this.terminal.tapService.isReady) {
      this.terminal.launchReadingTask();
    } else {
      this.terminal.stopReadingTask();
    }
  }
}
