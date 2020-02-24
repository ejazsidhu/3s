import { TestBed } from '@angular/core/testing';

import { FilestackService } from './filestack.service';

describe('FilestackService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FilestackService = TestBed.get(FilestackService);
    expect(service).toBeTruthy();
  });
});
