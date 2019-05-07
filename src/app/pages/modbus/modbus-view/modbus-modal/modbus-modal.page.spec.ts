import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModbusModalPage } from './modbus-modal.page';

describe('ModbusModalPage', () => {
  let component: ModbusModalPage;
  let fixture: ComponentFixture<ModbusModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModbusModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModbusModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
