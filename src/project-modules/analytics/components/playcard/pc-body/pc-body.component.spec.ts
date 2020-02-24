import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PcBodyComponent } from './pc-body.component';

describe('PcBodyComponent', () => {
  let component: PcBodyComponent;
  let fixture: ComponentFixture<PcBodyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PcBodyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PcBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
