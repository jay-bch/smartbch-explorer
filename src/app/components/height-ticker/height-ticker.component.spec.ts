import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeightTickerComponent } from './height-ticker.component';

describe('BchTickerComponent', () => {
  let component: HeightTickerComponent;
  let fixture: ComponentFixture<HeightTickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeightTickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeightTickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
