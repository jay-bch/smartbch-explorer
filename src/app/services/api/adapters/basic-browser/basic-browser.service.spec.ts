import { TestBed } from '@angular/core/testing';

import { BasicBrowserAdapter } from './basic-browser.service';

describe('BasicBrowserAdapter', () => {
  let service: BasicBrowserAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BasicBrowserAdapter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
