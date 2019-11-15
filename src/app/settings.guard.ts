import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate } from '@angular/router';
import { SettingsPage } from './pages/settings/settings.page';

@Injectable({
  providedIn: 'root'
})
export class SettingsGuard implements CanDeactivate<SettingsPage> {
  component: SettingsPage;
  route: ActivatedRouteSnapshot;

  canDeactivate(component: SettingsPage) {
    return component.canDeactivate();
  }
  
}
