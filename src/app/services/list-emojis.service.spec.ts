import { TestBed } from '@angular/core/testing';

import { ListEmojisService } from './list-emojis.service';

describe('ListEmojisService', () => {
  let service: ListEmojisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListEmojisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
