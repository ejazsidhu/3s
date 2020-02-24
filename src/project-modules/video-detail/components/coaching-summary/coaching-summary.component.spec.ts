import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachingSummaryComponent } from './coaching-summary.component';

describe('CoachingSummaryComponent', () => {
  let component: CoachingSummaryComponent;
  let fixture: ComponentFixture<CoachingSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachingSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachingSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
