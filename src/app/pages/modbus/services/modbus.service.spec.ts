import { TestBed } from '@angular/core/testing';

import { ModbusService } from './modbus.service';

describe('ModbusService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ModbusService = TestBed.get(ModbusService);
    expect(service).toBeTruthy();
  });
});
