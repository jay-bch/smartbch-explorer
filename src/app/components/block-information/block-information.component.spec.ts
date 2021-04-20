import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockInformationComponent } from './block-information.component';

describe('BlockInformationComponent', () => {
  let component: BlockInformationComponent;
  let fixture: ComponentFixture<BlockInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlockInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
