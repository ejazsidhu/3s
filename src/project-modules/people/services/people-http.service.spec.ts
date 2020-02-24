import { TestBed } from '@angular/core/testing';

import { PeopleHttpService } from './people-http.service';

describe('PeopleHttpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PeopleHttpService = TestBed.get(PeopleHttpService);
    expect(service).toBeTruthy();
  });
});
