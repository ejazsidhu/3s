import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HuddleTypeComponent } from './huddle-type.component';

describe('HuddleTypeComponent', () => {
  let component: HuddleTypeComponent;
  let fixture: ComponentFixture<HuddleTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HuddleTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HuddleTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
