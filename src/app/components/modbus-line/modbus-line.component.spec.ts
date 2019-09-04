import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModbusLineComponent } from './modbus-line.component';
import { ModbusLineModule } from './modbus-line.module';
import { MockFactory } from 'tests/mocks';
import { By } from '@angular/platform-browser';
import { DataDisplay } from 'src/app/helpers/modbus-helper';
import { $$ } from 'protractor';
import { IonItemSliding } from '@ionic/angular';

describe('ModbusLineComponent', () => {
  let component: ModbusLineComponent;
  let fixture: ComponentFixture<ModbusLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ModbusLineModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],

    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModbusLineComponent);
    component = fixture.componentInstance;
    component.modbusReadAnswers = MockFactory.getRandomModbusAnswersMap(5);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display 5 rows when given 5 entries', () => {
    expect(fixture.debugElement.queryAll(By.css('ion-item-sliding')).length).toBe(5);
  });

  it('should display "Pause" icon when the request is monitored, "Play" icon otherwise', () => {
    // get random request and set it as monitored
    const keys = Array.from(component.modbusReadAnswers.keys());
    const requestID = keys[Math.floor(Math.random() * keys.length)];
    spyOn(component, "isMonitored").and.callFake(id => {
      return id == requestID;
    }); // data with id 3 is the only one stubbed as monitored
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('ion-icon[ng-reflect-name=pause]')).length).toBe(1);
    expect(fixture.debugElement.queryAll(By.css('ion-icon[ng-reflect-name=play]')).length).toBe(keys.length - 1);
  });


  it('should display registers as DEC', () => {
    component.registerDisplayMode = "DEC";
    fixture.detectChanges();

    const registers = Array.from(
      fixture.debugElement.queryAll(
        By.css('ion-row.grid-body > :nth-child(2)')
      )
    ).map(_ => _.nativeElement.innerText.trim(' ')); // trim away spaces for comparison

    registers.forEach(register => {
      expect(UINT_REGEX.test(register)).toBe(true);
    })

  });

  it('should display registers as HEX', () => {
    component.registerDisplayMode = "HEX";
    fixture.detectChanges();

    const registers = Array.from(
      fixture.debugElement.queryAll(
        By.css('ion-row.grid-body > :nth-child(2)')
      )
    ).map(_ => _.nativeElement.innerText.trim(' ')); // trim away spaces for comparison

    registers.forEach(register => {
      expect(HEX_REGEX.test(register)).toBe(true);
    })

  });

  it('should display values as defined by dataDisplay prop', () => {

    const values = Array.from(
      fixture.debugElement.queryAll(
        By.css('ion-ion-row.grid-body > :nth-child(3)')
      )
    ).map(_ => _.nativeElement.innerText.trim(' ')); // trim away spaces for comparison

    const keys = Array.from(component.modbusReadAnswers.keys());

    for (let i = 0; i < values.length; i++) {
      switch (component.modbusReadAnswers.get(keys[i]).config.displayOptions.displayAs) {
        case DataDisplay.FLOAT:
          expect(FLOAT_REGEX.test(values[i])).toBe(true);
          break;
        case DataDisplay.U_INT:
          expect(UINT_REGEX.test(values[i])).toBe(true);
          break;
        case DataDisplay.INT:
          expect(INT_REGEX.test(values[i])).toBe(true);
          break;
        case DataDisplay.HEX:
          expect(HEX_REGEX.test(values[i])).toBe(true);
          break;
        case DataDisplay.ASCII:
          expect(ASCII_REGEX.test(values[i])).toBe(true);
        default:
          throw 'Unexpected DataDisplay value';
      }
    }

  });

  it('should call delete with te proper line ID on click', async () => {
    const indexes = [];
    spyOn(component, 'delete').and.callFake((val, el) => indexes.push(val)); // retrieve every index
    const deleteButtons = Array.from(
      fixture.debugElement.queryAll(
        By.css('ion-item-options[side=end]')
      )
    ).map( _ => _.nativeElement.childNodes[1]);

    const keys = Array.from(component.modbusReadAnswers.keys());

    for (let i = 0; i < keys.length; i++) {
      deleteButtons[i].click();
      await fixture.whenStable();
      expect(component.delete).toHaveBeenCalled();
      expect(indexes[i]).toBe(keys[i]);
    }
  });

  it('should call openSettings with te proper line ID', async () => {
    const indexes = [];
    spyOn(component, 'openSettings').and.callFake((val, el) => indexes.push(val)); // retrieve every index
    const settingsButtons = Array.from(
      fixture.debugElement.queryAll(
        By.css('ion-item-options[side=end]')
      )
    ).map( _ => _.nativeElement.childNodes[0]);

    const keys = Array.from(component.modbusReadAnswers.keys());

    for (let i = 0; i < keys.length; i++) {
      settingsButtons[i].click();
      await fixture.whenStable();
      expect(component.openSettings).toHaveBeenCalled();
      expect(indexes[i]).toBe(keys[i]);
    }
  });

  it('should call refresh with te proper line ID on click', async () => {
    const indexes = [];
    spyOn(component, 'refresh').and.callFake((val, el) => indexes.push(val)); // retrieve every index
    const refreshButtons = Array.from(
      fixture.debugElement.queryAll(
        By.css('ion-item-options[side=start]')
      )
    ).map( _ => _.nativeElement.childNodes[0]);

    const keys = Array.from(component.modbusReadAnswers.keys());

    for (let i = 0; i < keys.length; i++) {
      refreshButtons[i].click();
      await fixture.whenStable();
      expect(component.refresh).toHaveBeenCalled();
      expect(indexes[i]).toBe(keys[i]);
    }
  });
  it('should call toggleMonitoring with te proper line ID on click', async () => {
    const indexes = [];
    spyOn(component, 'toggleMonitoring').and.callFake((val, el) => indexes.push(val)); // retrieve every index
    const deleteButtons = Array.from(
      fixture.debugElement.queryAll(
        By.css('ion-item-options[side=start]')
      )
    ).map( _ => _.nativeElement.childNodes[1]);

    const keys = Array.from(component.modbusReadAnswers.keys());

    for (let i = 0; i < keys.length; i++) {
      deleteButtons[i].click();
      await fixture.whenStable();
      expect(component.toggleMonitoring).toHaveBeenCalled();
      expect(indexes[i]).toBe(keys[i]);
    }
  });

  it("should emit onDeleteClick on delete call", () => {
    const fakeID = MockFactory.getRandNumber(0, 0xFF);
    const fakeSlide = {
      closeOpened() {}
    };
    spyOn(fakeSlide, 'closeOpened');
    spyOn(component.onDeleteClick, 'emit');

    component.delete(fakeID, fakeSlide as IonItemSliding);

    expect(component.onDeleteClick.emit).toHaveBeenCalledWith(fakeID);
  });

  it("should emit onSettingsClick on delete call", () => {
    const fakeID = MockFactory.getRandNumber(0, 0xFF);
    const fakeSlide = {
      closeOpened() {}
    };
    spyOn(fakeSlide, 'closeOpened');
    spyOn(component.onSettingsClick, 'emit');

    component.openSettings(fakeID, fakeSlide as IonItemSliding);

    expect(component.onSettingsClick.emit).toHaveBeenCalledWith(fakeID);
  });

  it("should emit onRefreshClick on delete call", () => {
    const fakeID = MockFactory.getRandNumber(0, 0xFF);
    const fakeSlide = {
      closeOpened() {}
    };
    spyOn(fakeSlide, 'closeOpened');
    spyOn(component.onRefreshClick, 'emit');

    component.refresh(fakeID, fakeSlide as IonItemSliding);

    expect(component.onRefreshClick.emit).toHaveBeenCalledWith(fakeID);
  });

  it("should emit onMonitorClick on delete call", () => {
    const fakeID = MockFactory.getRandNumber(0, 0xFF);
    const fakeSlide = {
      closeOpened() {}
    };
    spyOn(fakeSlide, 'closeOpened');
    spyOn(component.onMonitorClick, 'emit');

    component.toggleMonitoring(fakeID, fakeSlide as IonItemSliding);

    expect(component.onMonitorClick.emit).toHaveBeenCalledWith(fakeID);
  });
});

const HEX_REGEX = /^0x[A-F0-9]+$/;
const UINT_REGEX = /^[0-9]+$/;
const INT_REGEX = /^-?[0-9]+$/;
const FLOAT_REGEX = /^-?\d*\.?\d*(e(\+|\-)\d*)?$/;
const ASCII_REGEX = /^[\x20-\x7F]+$/;