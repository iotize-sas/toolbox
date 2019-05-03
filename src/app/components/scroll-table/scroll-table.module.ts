import { NgModule } from '@angular/core';
import { ScrollTableComponent } from './scroll-table.component';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [ScrollTableComponent],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
    ],
    exports: [
        ScrollTableComponent
    ]
  })
  export class ScrollTableModule {}
