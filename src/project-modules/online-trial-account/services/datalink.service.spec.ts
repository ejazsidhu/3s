import { TestBed, inject } from '@angular/core/testing';

import { DatalinkService } from './datalink.service';

describe('DatalinkService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DatalinkService]
    });
  });

  it('should be created', inject([DatalinkService], (service: DatalinkService) => {
    expect(service).toBeTruthy();
  }));
});
