import { TestBed } from '@angular/core/testing';

import { CreateCalendarService } from './create-calendar.service';

describe('CreateCalendarService', () => {
  let service: CreateCalendarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateCalendarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
