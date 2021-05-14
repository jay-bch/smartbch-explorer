import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenIconComponent } from './token-icon.component';

describe('TokenIconComponent', () => {
  let component: TokenIconComponent;
  let fixture: ComponentFixture<TokenIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
