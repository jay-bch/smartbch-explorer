import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TxResultComponent } from './tx-result.component';

describe('TxResultComponent', () => {
  let component: TxResultComponent;
  let fixture: ComponentFixture<TxResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TxResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TxResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
