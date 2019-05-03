import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalPage } from './terminal.page';

describe('TerminalPage', () => {
  let component: TerminalPage;
  let fixture: ComponentFixture<TerminalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TerminalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TerminalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
