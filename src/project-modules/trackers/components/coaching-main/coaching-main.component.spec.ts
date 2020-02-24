import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachingMainComponent } from './coaching-main.component';

describe('CoachingMainComponent', () => {
  let component: CoachingMainComponent;
  let fixture: ComponentFixture<CoachingMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachingMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachingMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
