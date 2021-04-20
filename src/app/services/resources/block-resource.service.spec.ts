import { TestBed } from '@angular/core/testing';

import { BlockResourceService } from './block-resource.service';

describe('BlockResourceService', () => {
  let service: BlockResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlockResourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
