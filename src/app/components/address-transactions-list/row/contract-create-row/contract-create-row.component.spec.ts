import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractCreateRowComponent } from './contract-create-row.component';

describe('ContractCreateRowComponent', () => {
  let component: ContractCreateRowComponent;
  let fixture: ComponentFixture<ContractCreateRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractCreateRowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractCreateRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
