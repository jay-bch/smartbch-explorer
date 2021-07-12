import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionMethodComponent } from './transaction-method.component';

describe('TransactionMethodComponent', () => {
  let component: TransactionMethodComponent;
  let fixture: ComponentFixture<TransactionMethodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactionMethodComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
