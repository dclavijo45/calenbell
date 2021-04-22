import { TestBed } from '@angular/core/testing';

import { TokenAuthStateService } from './token-auth-state.service';

describe('TokenAuthStateService', () => {
  let service: TokenAuthStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenAuthStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
