import { NgModule } from '@angular/core';
import { EnumPipe } from './enum/enum.pipe';
import { TrimPipe } from './trim/trim.pipe';
import { ModbusDataPipe } from './modBusData/modbusData.pipe';
import { RssiToBarsPipe } from './rssiToBars/rssi-to-bars.pipe';
import { RegisterPipe } from './register/register.pipe';

@NgModule({
    imports: [],
    declarations: [EnumPipe, TrimPipe, ModbusDataPipe, RssiToBarsPipe, RegisterPipe],
    exports: [EnumPipe, TrimPipe, ModbusDataPipe, RssiToBarsPipe, RegisterPipe],
})

export class PipeModule {}
