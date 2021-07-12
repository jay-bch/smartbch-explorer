import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockResultComponent } from './block-result.component';

describe('BlockResultComponent', () => {
  let component: BlockResultComponent;
  let fixture: ComponentFixture<BlockResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlockResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
