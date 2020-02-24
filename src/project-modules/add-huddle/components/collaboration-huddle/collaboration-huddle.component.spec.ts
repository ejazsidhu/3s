import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaborationHuddleComponent } from './collaboration-huddle.component';

describe('CollaborationHuddleComponent', () => {
  let component: CollaborationHuddleComponent;
  let fixture: ComponentFixture<CollaborationHuddleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollaborationHuddleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollaborationHuddleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
