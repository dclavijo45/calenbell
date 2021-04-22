import { TestBed } from '@angular/core/testing';

import { InfoCurrentEventService } from './info-current-event.service';

describe('InfoCurrentEventService', () => {
  let service: InfoCurrentEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfoCurrentEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
