import { TestBed } from '@angular/core/testing';

import { Web3Adapter } from './web3.service';

describe('Web3Service', () => {
  let service: Web3Adapter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Web3Adapter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
