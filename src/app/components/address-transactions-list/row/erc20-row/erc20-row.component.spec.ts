import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Erc20RowComponent } from './erc20-row.component';

describe('Erc20RowComponent', () => {
  let component: Erc20RowComponent;
  let fixture: ComponentFixture<Erc20RowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Erc20RowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Erc20RowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
