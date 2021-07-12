import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralChipComponent } from './general-chip.component';

describe('GeneralChipComponent', () => {
  let component: GeneralChipComponent;
  let fixture: ComponentFixture<GeneralChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralChipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
