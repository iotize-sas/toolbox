import { Component, OnInit } from '@angular/core';
import { InfosService } from 'src/app/services/infos.service';
import { Subscription, timer, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { StringConverter } from '@iotize/device-client.js/client/impl';

@Component({
  selector: 'app-infos',
  templateUrl: './infos.page.html',
  styleUrls: ['./infos.page.scss'],
})
export class InfosPage  {

  constructor(public infos: InfosService) { }
  private _subscription: Subscription;
  tapInfos: {};
  ionViewWillEnter() {
    this._subscription = this.infos.getInfos().subscribe((infos) => {
      this.tapInfos = infos;
    });
  }

  ionViewWillLeave() {
    this._subscription.unsubscribe();
    this.tapInfos = null;
  }

  count = 0;
  start = new Date();
  end;
  diff;

  launchTestTask() {
    this.count = 0;
    this.start = new Date();
    const source = timer(0, 500);
    const mySubject = new Subject();
    const mySub = source.subscribe(() => {
      this.infos.tapService.tap.service.target.send(StringConverter.instance().encode('test'))
        .then(_ => this.infos.tapService.tap.service.target.readBytes()
          .then(_ => mySubject.next()).catch(_ => mySubject.error('command readBytes failed')))
        .catch(_ => mySubject.error('command send failed'));
    });
     mySubject.subscribe(() => {this.count+=2}, err => {console.error(err); this.end = new Date(); this.diff = (this.end-(this.start as any))/1000;});
  }
}
