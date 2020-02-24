import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachingDetailComponent } from './coaching-detail.component';

describe('CoachingDetailComponent', () => {
  let component: CoachingDetailComponent;
  let fixture: ComponentFixture<CoachingDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachingDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
