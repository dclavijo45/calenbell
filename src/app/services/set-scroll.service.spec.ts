import { TestBed } from '@angular/core/testing';

import { SetScrollService } from './set-scroll.service';

describe('SetScrollService', () => {
  let service: SetScrollService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SetScrollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
