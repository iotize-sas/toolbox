import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastController, Events } from '@ionic/angular';
import { ModbusService } from './services/modbus.service';

@Component({
  selector: 'app-modbus',
  templateUrl: './modbus.page.html',
  styleUrls: ['./modbus.page.scss'],
})
export class ModbusPage implements OnInit {

  constructor(public modbus: ModbusService,
    public events: Events,
    public changeDetector: ChangeDetectorRef,
    public toast: ToastController) {
      this.events.subscribe('connected', () => this.changeDetector.detectChanges());
      this.events.subscribe('disconnected', () => this.changeDetector.detectChanges());
      this.events.subscribe('error-message', message => this.showToast(message));
  }

  ngOnInit() {
    console.log('[TerminalViewPage] init');
    if (!this.modbus.settings.didFetchSettings) {
      this.modbus.settings.getUARTSettings();
    }
  }

  async showToast(message: string, duration: number = 3000): Promise<void> {
    const toast = await this.toast.create({
      message: message,
      duration: duration
    });

    toast.present();
  }

}
