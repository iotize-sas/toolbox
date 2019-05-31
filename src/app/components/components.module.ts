import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollTableModule } from './scroll-table/scroll-table.module';
import { LoginModule } from './login/login.module';
import { TapStatusModule } from './tap-status/tap-status.module';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        ScrollTableModule,
        LoginModule,
        TapStatusModule
    ],
    exports: [
        ScrollTableModule,
        LoginModule,
        TapStatusModule
    ]
  })
  export class ComponentsModule {}
