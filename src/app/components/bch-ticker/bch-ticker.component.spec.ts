import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BchTickerComponent } from './bch-ticker.component';

describe('BchTickerComponent', () => {
  let component: BchTickerComponent;
  let fixture: ComponentFixture<BchTickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BchTickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BchTickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
