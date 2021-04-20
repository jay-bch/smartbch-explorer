import { TestBed } from '@angular/core/testing';

import { NodeAdapter } from './adapter.service';

describe('AdapterService', () => {
  let service: NodeAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NodeAdapter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
