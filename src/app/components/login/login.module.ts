import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';

@NgModule({
    declarations: [LoginComponent],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
    ],
    exports: [
        LoginComponent
    ]
  })
  export class LoginModule {}
