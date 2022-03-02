import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnsNameResultcomponent } from './ens-name-result.component';

describe('EnsNameResultcomponent', () => {
  let component: EnsNameResultcomponent;
  let fixture: ComponentFixture<EnsNameResultcomponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnsNameResultcomponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnsNameResultcomponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
