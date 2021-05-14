import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressSEP20ListComponent } from './sep20-list.component';

describe('AddressEcr20ListComponent', () => {
  let component: AddressSEP20ListComponent;
  let fixture: ComponentFixture<AddressSEP20ListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddressSEP20ListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressSEP20ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
