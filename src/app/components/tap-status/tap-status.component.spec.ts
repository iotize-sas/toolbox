import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TapStatusComponent } from './tap-status.component';
import { By } from '@angular/platform-browser';
import { MockFactory } from 'tests/mocks';

describe('TapStatusComponent', () => {
  let component: TapStatusComponent;
  let fixture: ComponentFixture<TapStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TapStatusComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(TapStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // DOM Tests

  it('should not be visible if tap is not connected', () => {
    expect(fixture.nativeElement.textContent).toBeFalsy();
  });

  it('should be visible if connected and appName has been fetched', async () => {
    const mockProtocol = MockFactory.protocol();
    await component.tapService.init(mockProtocol);
    await component.makeBinds();
    fixture.detectChanges();
    const button = fixture.nativeElement;
    expect(button.textContent).toBeTruthy();
  });

  it('should display appName if connected and appName has been fetched', async () => {
    const mockProtocol = MockFactory.protocol();
    await component.tapService.init(mockProtocol);
    await component.makeBinds();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('div > p')).nativeElement.textContent).toContain(MockFactory.APP_NAME.toUpperCase());
  });

  it('should display login if connected and appName has been fetched', async () => {
    const mockProtocol = MockFactory.protocol();
    await component.tapService.init(mockProtocol);
    await component.makeBinds();
    fixture.detectChanges();
    const button = fixture.nativeElement;
    expect(button).toBeTruthy();
    expect(fixture.debugElement.query(By.css('div > p')).nativeElement.textContent).toContain(MockFactory.APP_NAME.toUpperCase());
  });


});