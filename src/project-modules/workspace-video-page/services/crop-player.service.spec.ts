import { TestBed, inject } from '@angular/core/testing';

import { CropPlayerService } from './crop-player.service';

describe('CropPlayerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CropPlayerService]
    });
  });

  it('should be created', inject([CropPlayerService], (service: CropPlayerService) => {
    expect(service).toBeTruthy();
  }));
});
