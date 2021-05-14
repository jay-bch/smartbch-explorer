import { TestBed } from '@angular/core/testing';

import { Erc20ResourceService } from './erc20-resource.service';

describe('Erc20ResourceService', () => {
  let service: Erc20ResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Erc20ResourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
