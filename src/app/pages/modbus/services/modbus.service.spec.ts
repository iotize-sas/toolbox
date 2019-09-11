import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ModbusService } from './modbus.service';
import { MockFactory } from 'tests/mocks';
import { ApiRequest, Response } from '@iotize/device-client.js/client/impl';
import { ModbusReadAnswer } from 'src/app/helpers/modbus-helper';

describe('ModbusService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ModbusService = TestBed.get(ModbusService);
    expect(service).toBeTruthy();
  });

  it('should call write with properly encoded data', async () => {
    const service: ModbusService = TestBed.get(ModbusService);
    spyOn(service, "write").and.callFake(function () {
      expect(arguments[0]).toEqual(Uint8Array.from([0xAB, 0xCD]));
      return Promise.resolve();
    });
    await service.sendNumber(0xABCD);
  });
  it('should call the tap modbusRead method and return the read value', async () => {
    const service: ModbusService = TestBed.get(ModbusService);
    const mockProtocol = MockFactory.protocol();
    await service.deviceService.init(mockProtocol);

    spyOn(service.deviceService.tap.service.target, 'modbusRead').and.callFake(() => Response.SUCCESS(Uint8Array.from([0xAB, 0xBC])));

    const response = await service.read();
    expect(response).toEqual(Uint8Array.from([0xAB, 0xBC]));
  });

  it('should call the tap modbusRead method and throw Tap response code on error', async () => {
    const service: ModbusService = TestBed.get(ModbusService);
    const mockProtocol = MockFactory.protocol();
    await service.deviceService.init(mockProtocol);

    spyOn(service.deviceService.tap.service.target, 'modbusRead').and.callFake(() => Response.ERROR(0xFF));
    spyOn(service, 'read').and.callThrough();
    try {
      const response = await service.read();
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBe(0xFF);
    }
  });

  it('should launch a monitoring task that reads a modbus request each period', fakeAsync(
    () => {
      const service: ModbusService = TestBed.get(ModbusService);

      const mockRequest = MockFactory.getRandomModbusAnswerRead();

      let times = 0;
      let received = undefined;
      spyOn(service, 'read').and.callFake(() => {
        return Promise.resolve(Uint8Array.from([times++]));
      });

      const subscription = service.monitoring(mockRequest).subscribe(val => {
        received = val;
      });

      // check that read is called each time a monitoring period as passed
      tick(mockRequest.config.monitoringPeriod);
      expect(received).toEqual({
        type:'next',
        answer: Uint8Array.from([0])
      });
      tick(mockRequest.config.monitoringPeriod);
      expect(received).toEqual({
        type:'next',
        answer: Uint8Array.from([1])
      });
      tick(mockRequest.config.monitoringPeriod);
      expect(received).toEqual({
        type:'next',
        answer: Uint8Array.from([2])
      });
      subscription.unsubscribe();
    })
  );

  it('should toggle monitoring on a saved modbus request', fakeAsync(
    () => {
    const service: ModbusService = TestBed.get(ModbusService);

    const mockRequest = new ModbusReadAnswer(MockFactory.getRandModbusConfig(), MockFactory.getBytes(true))
    service.lastModbusRead = mockRequest;
    service.keepLine();
    const id = Array.from(service.savedModbusValues.keys())[0];
    
    let times = 0;

    spyOn(service, 'read').and.callFake(() => {
      return Promise.resolve(Uint8Array.from([times++]));
    });

    service.toggleMonitoring(id);
    // request monitoring subscription is stored
    expect(service.isMonitored(id)).toBe(true);
    // monitoring is on
    tick(mockRequest.config.monitoringPeriod);
    expect(service.savedModbusValues.get(id).dataArray).toEqual(Uint8Array.from([0]));
    tick(mockRequest.config.monitoringPeriod);
    expect(service.savedModbusValues.get(id).dataArray).toEqual(Uint8Array.from([1]));
    tick(mockRequest.config.monitoringPeriod);
    expect(service.savedModbusValues.get(id).dataArray).toEqual(Uint8Array.from([2]));
    
    //stop monitoring, value does not change
    service.toggleMonitoring(id);
    expect(service.isMonitored(id)).toBe(false);
    tick(mockRequest.config.monitoringPeriod);
    expect(service.savedModbusValues.get(id).dataArray).toEqual(Uint8Array.from([2]));
  })
  )

});
