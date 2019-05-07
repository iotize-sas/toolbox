import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalSettingsPage } from './terminal-settings.page';

describe('SettingsPage', () => {
  let component: TerminalSettingsPage;
  let fixture: ComponentFixture<TerminalSettingsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TerminalSettingsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TerminalSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
