import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollTableModule } from './scroll-table/scroll-table.module';
import { TapStatusModule } from './tap-status/tap-status.module';
import { RssiModule } from './rssi/rssi.module';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        ScrollTableModule,
        TapStatusModule,
        RssiModule
    ],
    exports: [
        ScrollTableModule,
        TapStatusModule,
        RssiModule 
    ]
  })
  export class ComponentsModule {}
