import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultRowComponent } from './default-row.component';

describe('DefaultRowComponent', () => {
  let component: DefaultRowComponent;
  let fixture: ComponentFixture<DefaultRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefaultRowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
