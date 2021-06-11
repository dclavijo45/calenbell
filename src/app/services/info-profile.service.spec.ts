import { TestBed } from '@angular/core/testing';

import { InfoProfileService } from './info-profile.service';

describe('InfoProfileService', () => {
  let service: InfoProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfoProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
