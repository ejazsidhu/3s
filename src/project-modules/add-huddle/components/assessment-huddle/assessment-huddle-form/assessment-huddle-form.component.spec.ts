import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentHuddleFormComponent } from './assessment-huddle-form.component';

describe('AssessmentHuddleComponent', () => {
  let component: AssessmentHuddleFormComponent;
  let fixture: ComponentFixture<AssessmentHuddleFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentHuddleFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentHuddleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
