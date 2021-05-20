import { TestBed } from '@angular/core/testing';

import { Sep20ResourceService } from './sep20-resource.service';

describe('Erc20ResourceService', () => {
  let service: Sep20ResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sep20ResourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
