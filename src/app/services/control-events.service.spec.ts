import { TestBed } from '@angular/core/testing';

import { ControlEventsService } from './control-events.service';

describe('ControlEventsService', () => {
  let service: ControlEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ControlEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
