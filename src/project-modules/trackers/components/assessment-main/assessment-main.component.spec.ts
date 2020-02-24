import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentMainComponent } from './assessment-main.component';

describe('AssessmentMainComponent', () => {
  let component: AssessmentMainComponent;
  let fixture: ComponentFixture<AssessmentMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
