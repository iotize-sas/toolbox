import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RssiComponent } from './rssi.component';
import { By } from '@angular/platform-browser';

describe('RssiComponent', () => {
  let component: RssiComponent;
  let fixture: ComponentFixture<RssiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RssiComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RssiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display 5 empty bars', () => {
    component.bars = 0;
    fixture.detectChanges();
    const debugEls = fixture.debugElement.queryAll(By.css('rect'));
    testDebugElements(debugEls, undefined, 0);

    component.bars = -200;
    fixture.detectChanges();
    const debugEls2 = fixture.debugElement.queryAll(By.css('rect'));
    testDebugElements(debugEls2, undefined, 0);
  });

  it('should display 1 red bar and 4 empty bars', () => {
    component.bars = 1;
    fixture.detectChanges();
    const debugEls = fixture.debugElement.queryAll(By.css('rect'));

    testDebugElements(debugEls, '#E51E25', 1);

    });

  it('should display 2 yellow bars and 3 empty bars', () => {
    component.bars = 2;
    fixture.detectChanges();
    const debugEls = fixture.debugElement.queryAll(By.css('rect'));

    testDebugElements(debugEls, '#FEC212', 2);

  });

  it('should display 3 yellow bars and 2 empty bars', () => {
    component.bars = 3;
    fixture.detectChanges();
    const debugEls = fixture.debugElement.queryAll(By.css('rect'));

    testDebugElements(debugEls, '#FEC212', 3);

  });
  it('should display 4 green bars and 1 empty bar', () => {
    component.bars = 4;
    fixture.detectChanges();
    const debugEls = fixture.debugElement.queryAll(By.css('rect'));

    testDebugElements(debugEls, '#0FAF4B', 4);

  });

  it('should display 5 green bars', () => {
    component.bars = 5;
    fixture.detectChanges();
    const debugEls = fixture.debugElement.queryAll(By.css('rect'));

    testDebugElements(debugEls, '#0FAF4B', 5);

    component.bars = 800;
    fixture.detectChanges();
    const debugEls2 = fixture.debugElement.queryAll(By.css('rect'));

    testDebugElements(debugEls2, '#0FAF4B', 5);

  });

});

function testDebugElements(debugElements: DebugElement[], colorString: string, expectedBars: number) {
  expect(debugElements.length).toBe(5);

  //first bar red and filled, others empty
  debugElements.forEach((debugElement, index) => {
    if (index < expectedBars) {
      expect(debugElement.parent.attributes['color']).toBe(colorString);
      expect(debugElement.attributes['fill-opacity']).toBe('1');
    } else {
      expect(debugElement.attributes['fill-opacity']).toBe('0');
    }
  });
}