import { TestBed } from '@angular/core/testing';

import { ContractResourceService } from './contract-resource.service';

describe('ContractResourceService', () => {
  let service: ContractResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContractResourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
