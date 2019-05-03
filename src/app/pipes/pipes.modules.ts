import { NgModule } from '@angular/core';
import { EnumPipe } from './enum/enum.pipe';
import { TrimPipe } from './trim/trim.pipe';

@NgModule({
    imports: [],
    declarations: [EnumPipe, TrimPipe],
    exports: [EnumPipe, TrimPipe],
})

export class PipeModule {}
