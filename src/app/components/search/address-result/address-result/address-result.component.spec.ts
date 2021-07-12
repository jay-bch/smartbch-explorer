import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressResultComponent } from './address-result.component';

describe('AddressResultComponent', () => {
  let component: AddressResultComponent;
  let fixture: ComponentFixture<AddressResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddressResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
