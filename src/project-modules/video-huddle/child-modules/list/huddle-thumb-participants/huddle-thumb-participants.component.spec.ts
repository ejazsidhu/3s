import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HuddleThumbParticipantsComponent } from './huddle-thumb-participants.component';

describe('HuddleThumbParticipantsComponent', () => {
  let component: HuddleThumbParticipantsComponent;
  let fixture: ComponentFixture<HuddleThumbParticipantsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HuddleThumbParticipantsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HuddleThumbParticipantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
