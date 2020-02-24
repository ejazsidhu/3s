import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VBodyComponent } from './v-body.component';

describe('VBodyComponent', () => {
  let component: VBodyComponent;
  let fixture: ComponentFixture<VBodyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VBodyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
