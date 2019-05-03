import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModbusViewPage } from './modbus-view.page';

describe('ModbusViewPage', () => {
  let component: ModbusViewPage;
  let fixture: ComponentFixture<ModbusViewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModbusViewPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModbusViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
