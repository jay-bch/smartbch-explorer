import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressEcr20ListComponent } from './address-ecr20-list.component';

describe('AddressEcr20ListComponent', () => {
  let component: AddressEcr20ListComponent;
  let fixture: ComponentFixture<AddressEcr20ListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddressEcr20ListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressEcr20ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
