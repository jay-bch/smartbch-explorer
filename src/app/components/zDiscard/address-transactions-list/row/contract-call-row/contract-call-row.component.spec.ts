import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractCallRowComponent } from './contract-call-row.component';

describe('ContractCallRowComponent', () => {
  let component: ContractCallRowComponent;
  let fixture: ComponentFixture<ContractCallRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractCallRowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractCallRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
