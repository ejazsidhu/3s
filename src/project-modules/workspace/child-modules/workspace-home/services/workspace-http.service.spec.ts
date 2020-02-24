import { TestBed } from '@angular/core/testing';

import { WorkspaceHttpService } from './workspace-http.service';

describe('WorkspaceHttpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WorkspaceHttpService = TestBed.get(WorkspaceHttpService);
    expect(service).toBeTruthy();
  });
});
