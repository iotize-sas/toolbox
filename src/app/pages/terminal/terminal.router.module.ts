import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TerminalPage } from './terminal.page';

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
            loadChildren: './terminal-view/terminal-view.module#TerminalViewPageModule'
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadChildren: './terminal-settings/terminal-settings.module#TerminalSettingsPageModule'
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
  exports: [RouterModule]
})
export class TerminalPageRoutingModule { }
