import { TestBed, inject } from '@angular/core/testing';

import { PlaycardService } from './playcard.service';

describe('PlaycardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlaycardService]
    });
  });

  it('should be created', inject([PlaycardService], (service: PlaycardService) => {
    expect(service).toBeTruthy();
  }));
});
