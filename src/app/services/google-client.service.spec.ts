import { TestBed } from '@angular/core/testing';

import { GoogleClientService } from './google-client.service';

describe('GoogleClientService', () => {
  let service: GoogleClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
