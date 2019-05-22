import { TestBed } from '@angular/core/testing';

import { TapServiceService } from './tap.service';

describe('TapServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TapServiceService = TestBed.get(TapServiceService);
    expect(service).toBeTruthy();
  });
});
