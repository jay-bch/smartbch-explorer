import { TestBed } from '@angular/core/testing';

import { UtilHelperService } from './util-helper.service';

describe('UtilHelperService', () => {
  let service: UtilHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
