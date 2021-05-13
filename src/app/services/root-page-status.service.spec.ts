import { TestBed } from '@angular/core/testing';

import { RootPageStatusService } from './root-page-status.service';

describe('RootPageStatusService', () => {
  let service: RootPageStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RootPageStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
