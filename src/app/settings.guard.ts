import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CanDeactivate } from '@angular/router/src/utils/preactivation';
import { SettingsPage } from './pages/settings/settings.page';

@Injectable({
  providedIn: 'root'
})
export class SettingsGuard implements CanDeactivate{
  component: SettingsPage;
  route: ActivatedRouteSnapshot;

  canDeactivate(component: SettingsPage) {
    return component.canDeactivate();
  }
  
}
