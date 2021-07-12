import { TestBed } from '@angular/core/testing';

import { Sep20HelperService } from './sep20-helper.service';

describe('Sep20HelperService', () => {
  let service: Sep20HelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sep20HelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
