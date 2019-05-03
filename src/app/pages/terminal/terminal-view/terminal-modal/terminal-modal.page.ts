import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { TerminalService } from '../../services/terminal.service';

@Component({
  selector: 'app-terminal-modal',
  templateUrl: './terminal-modal.page.html',
  styleUrls: ['./terminal-modal.page.scss'],
})
export class TerminalModalPage implements OnInit {

  constructor(public terminal: TerminalService,
              public modal: ModalController) { }

  ngOnInit() {
  }
  dismiss() {
    this.modal.dismiss();
  }
}
