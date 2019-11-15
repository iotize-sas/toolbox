import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { TerminalService } from './services/terminal.service';
import { Events, IonTabs, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.page.html',
  styleUrls: ['./terminal.page.scss'],
})
export class TerminalPage {

  constructor(public terminal: TerminalService,
    public events: Events,
    public changeDetector: ChangeDetectorRef,
    public toast: ToastController) {
      this.terminal.tapService.connectionState.subscribe(() => this.changeDetector.detectChanges());
      this.events.subscribe('error-message', message => this.showToast(message));
  }
  @ViewChild(IonTabs, {static: false}) tabs: IonTabs;

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

  async showToast(message: string, duration: number = 3000): Promise<void> {
    const toast = await this.toast.create({
      message: message,
      duration: duration
    });

    toast.present();
  }

  ionViewDidLeave() {
    this.terminal.stopReadingTask();
  }

  ionViewWillEnter() {
    this.tabChanged();
  }
}
