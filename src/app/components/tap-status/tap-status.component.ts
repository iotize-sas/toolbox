import { Component, OnInit, Input } from '@angular/core';
import { TapService } from 'src/app/services/tap.service';
import { Events } from '@ionic/angular';

@Component({
  selector: 'tap-status',
  templateUrl: './tap-status.component.html',
  styleUrls: ['./tap-status.component.scss'],
})
export class TapStatusComponent implements OnInit {

    appName: string;
    userName: string;

  constructor(public tapService: TapService,
    public events: Events) { }

  ngOnInit() {
    this.events.subscribe('connected',() => {
      console.log('binding tap status');
      this.makeBinds()
    })
  }

  async makeBinds() {
    this.appName = (await this.tapService.tap.service.interface.getAppName()).body();
    this.tapService.tap.sessionState.subscribe(_ => this.userName = _.name);
  }

}
