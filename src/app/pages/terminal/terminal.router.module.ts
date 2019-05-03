import { NgModule } from '@angular/core';
import { RouterModule, Routes, RouteReuseStrategy } from '@angular/router';
import { TerminalPage } from './terminal.page';
import { CustomReuseStrategy } from '../../custom-reuse-strategy';

const routes: Routes = [
  {
    path: '',
    component: TerminalPage,
    children: [
      {
        path: '',
        redirectTo: 'terminal',
        pathMatch: 'full',
      },
      {
        path: 'terminal',
        children: [
          {
            path: '',
            loadChildren: '../terminal/terminal-view/terminal-view.module#TerminalViewPageModule'
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadChildren: '../terminal/settings/settings.module#SettingsPageModule'
          }
        ]
      }
    ]
  }
//   ,
//   {
//     path: '',
//     redirectTo: '/tabs/home',
//     pathMatch: 'full'
//   }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy }
  ],
  exports: [RouterModule]
})
export class TerminalPageRoutingModule { }
