import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Logline, LoggerService } from '../services/logger.service';
import { TerminalService } from '../services/terminal.service';
import { ModalController, IonContent } from '@ionic/angular';
import { TerminalModalPage } from './terminal-modal/terminal-modal.page';

@Component({
  selector: 'app-terminal-view',
  templateUrl: './terminal-view.page.html',
  styleUrls: ['./terminal-view.page.scss'],
})
export class TerminalViewPage implements OnInit {

  @ViewChild(IonContent) content: IonContent;

  data = '';
  linesCount = 0;

  logLines: Array<Logline> = [];
  constructor(public terminal: TerminalService,
    public logger: LoggerService,
    public changeDetector: ChangeDetectorRef,
    public modalController: ModalController) { }

  ngOnInit() {
    console.log('terminal-view init');
    if (!this.terminal.settings.didFetchSettings) {
      this.terminal.settings.getUARTSettings();
    }

    this.logger.getLogLinesObservable()
      .subscribe((logLine) => {
        this.logLines.push(logLine);
        this.changeDetector.detectChanges();
        this.content.scrollToBottom(0);
      });
  }

  send() {
      this.terminal.sendInput();
  }

  clear() {
    this.logLines.splice(0);
    this.logger.clearHistory();
  }

  async openSettingsModal() {
    const modal = await this.modalController.create({
      component: TerminalModalPage
    });

    return await modal.present();
  }

}
