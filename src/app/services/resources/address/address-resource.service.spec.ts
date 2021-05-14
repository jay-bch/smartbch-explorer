import { TestBed } from '@angular/core/testing';

import { AddressResourceService } from './address-resource.service';

describe('AddressResourceService', () => {
  let service: AddressResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddressResourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
