import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TapStatusComponent } from './tap-status.component';
import { MockProtocol } from '@iotize/device-com-mock.js'
import { ApiRequest, Response } from '@iotize/device-com-mock.js/node_modules/@iotize/device-client.js/client/impl';
import { By } from '@angular/platform-browser';
import { StringConverter, NumberConverter } from '@iotize/device-client.js/client/impl';

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
    const mockProtocol = createMock();
    await component.tapService.init(mockProtocol);
    await component.makeBinds();
    fixture.detectChanges();
    const button = fixture.nativeElement;
    expect(button.textContent).toBeTruthy();
  });

  it('should display appName if connected and appName has been fetched', async () => {
    const mockProtocol = createMock();
    await component.tapService.init(mockProtocol);
    await component.makeBinds();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('div > p')).nativeElement.textContent).toContain(APP_NAME.toUpperCase());
  });

  it('should display login if connected and appName has been fetched', async () => {
    const mockProtocol = createMock();
    await component.tapService.init(mockProtocol);
    await component.makeBinds();
    fixture.detectChanges();
    const button = fixture.nativeElement;
    expect(button).toBeTruthy();
    expect(fixture.debugElement.query(By.css('div > p')).nativeElement.textContent).toContain(APP_NAME.toUpperCase());
  });


});



function createMock() {
  const mockProtocol = new MockProtocol();

  // Disconnect from target
  mockProtocol.mapResponse(ApiRequest.POST('/1027//4'), Response.SUCCESS());
  // Current target protocol MODBUS
  mockProtocol.mapResponse(ApiRequest.GET('/1027//1'), Response.SUCCESS(new Uint8Array([3])));
  // Connect to target
  mockProtocol.mapResponse(ApiRequest.POST('/1027//3'), Response.SUCCESS());
  // get AppName
  mockProtocol.mapResponse(ApiRequest.GET('/1024//9'), Response.SUCCESS(StringConverter.instance().encode(APP_NAME)));
  // keepAlive
  mockProtocol.mapResponse(ApiRequest.GET('/1024//4'), Response.SUCCESS());
  
    //session state
    // interface.getCurrentGroupId
    mockProtocol.mapResponse(ApiRequest.GET('/1024//7'), Response.SUCCESS(NumberConverter.uint32Instance().encode(65535)));
    
    // group.getName
    mockProtocol.mapResponse(ApiRequest.GET('/1025/65535/0'), Response.SUCCESS(StringConverter.instance().encode('TEST_USER')));
    
    // group.getSessionLifetime
    mockProtocol.mapResponse(ApiRequest.GET('/1025/65535/4'), Response.SUCCESS(NumberConverter.int32Instance().encode(-1)));

  return mockProtocol;
}

const APP_NAME = 'testAppName';