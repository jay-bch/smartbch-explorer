import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecodedValuesComponent } from './decoded-values.component';

describe('DecodedValuesComponent', () => {
  let component: DecodedValuesComponent;
  let fixture: ComponentFixture<DecodedValuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DecodedValuesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DecodedValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
