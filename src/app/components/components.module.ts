import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollTableModule } from './scroll-table/scroll-table.module';
import { LoginModule } from './login/login.module';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        ScrollTableModule,
        LoginModule
    ],
    exports: [
        ScrollTableModule,
        LoginModule
    ]
  })
  export class ComponentsModule {}
