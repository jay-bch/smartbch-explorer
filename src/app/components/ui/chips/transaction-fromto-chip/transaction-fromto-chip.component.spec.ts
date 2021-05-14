import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionFromtoChipComponent } from './transaction-fromto-chip.component';

describe('TransactionFromtoChipComponent', () => {
  let component: TransactionFromtoChipComponent;
  let fixture: ComponentFixture<TransactionFromtoChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactionFromtoChipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionFromtoChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
