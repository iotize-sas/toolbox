import { Component, OnInit, ViewChild, AfterViewChecked, AfterContentChecked, DoCheck } from '@angular/core';
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

  @ViewChild('content') content: IonContent;

  data = '';
  linesCount = 0;

  logLines: Array<Logline> = [];
  constructor(public terminal: TerminalService,
    public logger: LoggerService,
    public modalController: ModalController) { }

  ngOnInit() {
    console.log('[TerminalViewPage] init');
    if (!this.terminal.settings.didFetchSettings) {
      this.terminal.settings.getUARTSettings();
    }

    this.logger.getLogLinesObservable()
      .subscribe((logLines) => {
        this.logLines = logLines;
        setTimeout( () => this.content.scrollToBottom(0), 50); // TODO enhance scrolling management (stop auto-scroll if user scrolled up et al)
      });
  }
  
  ionViewDidEnter() {
      this.terminal.launchReadingTask();
  }

  ionViewWillLeave() {
      this.terminal.stopReadingTask();
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
