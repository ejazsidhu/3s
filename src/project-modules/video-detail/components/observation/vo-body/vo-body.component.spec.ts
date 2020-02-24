import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoBodyComponent } from './vo-body.component';

describe('VoBodyComponent', () => {
  let component: VoBodyComponent;
  let fixture: ComponentFixture<VoBodyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoBodyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
