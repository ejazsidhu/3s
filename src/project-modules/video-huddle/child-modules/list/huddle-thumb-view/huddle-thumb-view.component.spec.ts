import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HuddleThumbViewComponent } from './huddle-thumb-view.component';

describe('HuddleThumbViewComponent', () => {
  let component: HuddleThumbViewComponent;
  let fixture: ComponentFixture<HuddleThumbViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HuddleThumbViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HuddleThumbViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
