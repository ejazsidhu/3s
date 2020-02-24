import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachingHuddleComponent } from './coaching-huddle.component';

describe('CoachingHuddleComponent', () => {
  let component: CoachingHuddleComponent;
  let fixture: ComponentFixture<CoachingHuddleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachingHuddleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachingHuddleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
