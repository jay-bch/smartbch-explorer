import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RichTooltipComponent } from './rich-tooltip.component';

describe('RichTooltipComponent', () => {
  let component: RichTooltipComponent;
  let fixture: ComponentFixture<RichTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RichTooltipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RichTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
