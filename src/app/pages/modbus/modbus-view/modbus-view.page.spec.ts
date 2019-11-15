import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModbusViewPage } from './modbus-view.page';
import { ModbusService } from "../services/modbus.service";

import { PipeModule } from 'src/app/pipes/pipes.modules';
import { ModalController } from '@ionic/angular';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { MockFactory } from 'tests/mocks';
import { ModbusOptions } from '@iotize/device-client.js/device/model';

describe('ModbusViewPage', () => {
  let component: ModbusViewPage;
  let fixture: ComponentFixture<ModbusViewPage>;
  let mockModbusService;
  let mockModalController;
  let keyboardSpy;

  beforeEach(async(() => {


    keyboardSpy = jasmine.createSpyObj('Keyboard', mockKeyboard);

    TestBed.configureTestingModule({
      declarations: [ModbusViewPage],
      imports: [PipeModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ModbusService, useValue: MockFactory.getModbusService()
        },
        {
          provide: ModalController, useValue: MockFactory.getModalController()
        },
        {
          provide: Keyboard, useValue: keyboardSpy
        }
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

  it('should display modbus options', () => {
    const options = [ // default modbus options
      {prop:'slave', value: 1},
      {prop:'address', value: '0x0000'},
      {prop:'objectTypeString', value: 'DEFAULT'},
      {prop:'formatString', value: '16_BITS'},
      {prop:'length', value: 1},
      {prop:'displayOptions.displayAs', value: 'HEX'}
    ];
    const elements = fixture.nativeElement.querySelectorAll('ion-col.right-align');
    expect(elements.length).toBe(6);
    for (let i = 0; i < options.length; i++) {
      expect(elements[i].innerHTML).toContain(options[i].value)
    }
  });

  it('should disable text input if canSend is false', () => {
    
    spyOn(component.modbus, 'canSend').and.returnValue(false);
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.querySelector('ion-input');
    const button = fixture.nativeElement.querySelector('ion-button[color="secondary"]')
    expect(inputEl.disabled).toBe(true);
    expect(inputEl.placeholder).toBe("Read only");
    expect(button.disabled).toBe(true);
  });

  it('should enable text input and button if canSend is true', () => {
    spyOn(component.modbus, 'canSend').and.returnValue(true);
    fixture.detectChanges();
    const inputEl = fixture.nativeElement.querySelector('ion-input');
    const button = fixture.nativeElement.querySelector('ion-button[color="secondary"]')
    expect(inputEl.disabled).toBe(false);
    expect(inputEl.placeholder).toBe("Data input");
    expect(button.disabled).toBe(false);
  });

  it ('should call modbus.keepline to save a request', () => {
    let keepSpy = spyOn(component.modbus, 'keepLine')
    component.modbus.lastModbusRead = MockFactory.getRandomModbusAnswerRead();
    component.keepLine();
      
    expect(keepSpy).toHaveBeenCalled();
  });
});

const mockKeyboard = {
  hide: () => true
}

function getProp(obj: any, prop: string) {
  if (typeof obj !== 'object') {
    throw new Error(`${obj} in not an object`);
  }
	const propTree = prop.split('.');
  if (propTree[0] && propTree[0] in obj) {
    const currentProp = propTree[0];
    const currentValue = obj[currentProp];
    if (propTree.length > 1) {
    	return getProp(currentValue, propTree.slice(1).join('.'));
    }
    return currentValue
  }
  throw new Error(`property ${propTree[0]} does not exist in ${ JSON.stringify(obj) }`);
}