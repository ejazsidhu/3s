import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UdBodyComponent } from './ud-body.component';

describe('UdBodyComponent', () => {
  let component: UdBodyComponent;
  let fixture: ComponentFixture<UdBodyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UdBodyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UdBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
