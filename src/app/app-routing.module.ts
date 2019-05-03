import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes, RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from './custom-reuse-strategy';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: './pages/home/home.module#HomePageModule'
  },
  { 
    path: 'terminal',
    loadChildren: './pages/terminal/terminal.module#TerminalPageModule'
  },
  { path: 'modbus', loadChildren: './pages/modbus/modbus.module#ModbusPageModule' }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
