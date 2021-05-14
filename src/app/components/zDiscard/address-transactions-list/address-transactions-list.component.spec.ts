import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressTransactionsListComponentOld } from './address-transactions-list.component';

describe('AddressTransactionsListComponent', () => {
  let component: AddressTransactionsListComponentOld;
  let fixture: ComponentFixture<AddressTransactionsListComponentOld>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddressTransactionsListComponentOld ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressTransactionsListComponentOld);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
