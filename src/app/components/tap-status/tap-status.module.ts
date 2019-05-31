import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginModule } from '../login/login.module';
import { TapStatusComponent } from './tap-status.component';

@NgModule({
    declarations: [TapStatusComponent],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        LoginModule
    ],
    exports: [
        TapStatusComponent
    ]
  })
  export class TapStatusModule {}
