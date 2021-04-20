import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressTransactionsListComponent } from './address-transactions-list.component';

describe('AddressTransactionsListComponent', () => {
  let component: AddressTransactionsListComponent;
  let fixture: ComponentFixture<AddressTransactionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddressTransactionsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressTransactionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
