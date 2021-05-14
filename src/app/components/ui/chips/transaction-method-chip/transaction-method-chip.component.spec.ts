import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionMethodChipComponent } from './transaction-method-chip.component';

describe('TransactionMethodChipComponent', () => {
  let component: TransactionMethodChipComponent;
  let fixture: ComponentFixture<TransactionMethodChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactionMethodChipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionMethodChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
