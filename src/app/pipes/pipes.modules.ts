import { NgModule } from '@angular/core';
import { EnumPipe } from './enum/enum.pipe';
import { TrimPipe } from './trim/trim.pipe';
import { ModbusDataPipe } from './modBusData/modbusData.pipe';

@NgModule({
    imports: [],
    declarations: [EnumPipe, TrimPipe, ModbusDataPipe],
    exports: [EnumPipe, TrimPipe, ModbusDataPipe],
})

export class PipeModule {}
