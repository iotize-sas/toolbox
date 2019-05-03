import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModbusPage } from './modbus.page';

describe('ModbusPage', () => {
  let component: ModbusPage;
  let fixture: ComponentFixture<ModbusPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModbusPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModbusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
