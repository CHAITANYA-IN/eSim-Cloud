import { TestBed } from '@angular/core/testing';

import { FileHandlingService } from './file-handling.service';

describe('FileHandlingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FileHandlingService = TestBed.get(FileHandlingService);
    expect(service).toBeTruthy();
  });
});
