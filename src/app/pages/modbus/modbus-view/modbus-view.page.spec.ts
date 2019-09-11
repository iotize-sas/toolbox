import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModbusViewPage } from './modbus-view.page';
import { ModbusService } from '../services/modbus.service';
import { ModbusViewPageModule } from './modbus-view.module';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ModbusOptions, VariableFormat } from '@iotize/device-client.js/device/model';
import { ModbusConfig, DataDisplay, ByteOrder } from 'src/app/helpers/modbus-helper';

describe('ModbusViewPage', () => {
  let component: ModbusViewPage;
  let fixture: ComponentFixture<ModbusViewPage>;
  let modbusServiceSpy;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [ModbusViewPageModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ModbusService, useValue: MOCK_MODBUS_SERVICE },
        { provide: Keyboard, useValue: {} }
      ]
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

  it('should fetchSettings on Init', () => {
    console.log(component.modbus);
    spyOn(component.modbus.settings, 'getUARTSettings');
    component.ngOnInit();
    expect(component.modbus.settings.getUARTSettings).toHaveBeenCalled();
  });

  
});

const MOCK_MODBUS_SERVICE = {
  settings: {
    didFetchSettings: false,
    getUARTSettings() {
      return Promise.resolve()
    }
  },
  deviceService: {
    isReady: true
  },
  displayedModbusOptions: new ModbusConfig({
    address: 0,
    slave: 1,
    format: VariableFormat._16_BITS,
    length: 1,
    objectType: ModbusOptions.ObjectType.DEFAULT
  }, {
    displayAs: DataDisplay.HEX,
    byteOrder: ByteOrder.B3_B2_B1_B0
  }),
  get savedModbusOptions() {
    return this.displayedModbusOptions;
  }
}