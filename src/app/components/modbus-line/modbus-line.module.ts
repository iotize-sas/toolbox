import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModbusLineComponent } from './modbus-line.component';
import { PipeModule } from 'src/app/pipes/pipes.modules';

@NgModule({
    declarations: [ModbusLineComponent],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        PipeModule
    ],
    exports: [
        ModbusLineComponent
    ]
  })
  export class ModbusLineModule {}
