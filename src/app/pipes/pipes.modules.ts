import { NgModule } from '@angular/core';
import { EnumPipe } from './enum/enum.pipe';
import { TrimPipe } from './trim/trim.pipe';
import { RssiToBarsPipe } from './rssiToBars/rssi-to-bars.pipe';
import { RegisterPipe } from './register/register.pipe';
import { BufferPipe } from './buffer/buffer.pipe';

@NgModule({
    imports: [],
    declarations: [EnumPipe, TrimPipe, RssiToBarsPipe, RegisterPipe, BufferPipe],
    exports: [EnumPipe, TrimPipe, RssiToBarsPipe, RegisterPipe, BufferPipe],
})

export class PipeModule {}
