import { TestBed } from '@angular/core/testing';

import { ModbusSettingsService } from './modbus-settings.service';

describe('ModbusSettingsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ModbusSettingsService = TestBed.get(ModbusSettingsService);
    expect(service).toBeTruthy();
  });
});
