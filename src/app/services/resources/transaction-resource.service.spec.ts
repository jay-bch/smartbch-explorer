import { TestBed } from '@angular/core/testing';

import { TransactionResourceService } from './transaction-resource.service';

describe('TransactionResourceService', () => {
  let service: TransactionResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionResourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
