import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaMaskConnectComponent } from './meta-mask-connect.component';

describe('MetaMaskConnectComponent', () => {
  let component: MetaMaskConnectComponent;
  let fixture: ComponentFixture<MetaMaskConnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetaMaskConnectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetaMaskConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
