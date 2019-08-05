import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { ModbusReadAnswer, DataDisplay } from 'src/app/helpers/modbus-helper';
import { IonItemSliding } from '@ionic/angular';
import { ModbusService } from 'src/app/pages/modbus/services/modbus.service';

@Component({
  selector: 'modbus-line',
  templateUrl: './modbus-line.component.html',
  styleUrls: ['./modbus-line.component.scss'],
})
export class ModbusLineComponent implements OnInit {

  @Input() modbusReadAnswers: Map<number,ModbusReadAnswer>;
  @Input() registerDisplayMode: 'HEX' | 'DEC';
  @Output() onDeleteClick = new EventEmitter<number>();
  @Output() onRefreshClick = new EventEmitter<number>();
  @Output() onMonitorClick = new EventEmitter<number>();
  @Output() onSettingsClick = new EventEmitter<number>();

  constructor(public modbus: ModbusService) { }

  ngOnInit() {}

  isMonitored(id) {
    return this.modbus.isMonitored(id);
  }
  delete(index, slidingEl: IonItemSliding){
    slidingEl.closeOpened();
    this.onDeleteClick.emit(index);
    console.log('onDelete event emitted with index', index);
  }
  refresh(index, slidingEl: IonItemSliding){
    slidingEl.closeOpened();
    this.onRefreshClick.emit(index);
    console.log('onRefresh event emitted with index', index);
  }
  toggleMonitoring(index, slidingEl: IonItemSliding){
    slidingEl.closeOpened();
    this.onMonitorClick.emit(index);
    console.log('onMonitor event emitted with index', index);
  }
  
  openSettings(index, slidingEl) {
    slidingEl.closeOpened();
    this.onSettingsClick.emit(index);
    console.log('onSettings event emitted with index', index);
  }
}
