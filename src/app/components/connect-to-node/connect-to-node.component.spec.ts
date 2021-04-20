import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectToNodeComponent } from './connect-to-node.component';

describe('ConnectToNodeComponent', () => {
  let component: ConnectToNodeComponent;
  let fixture: ComponentFixture<ConnectToNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectToNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectToNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
