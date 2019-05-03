import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { ScrollTableComponent } from './scroll-table/scroll-table.component';

@NgModule({
    declarations: [LoginComponent, ScrollTableComponent],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
    ],
    exports: [
        LoginComponent,
        ScrollTableComponent
    ]
  })
  export class ComponentsModule {}
