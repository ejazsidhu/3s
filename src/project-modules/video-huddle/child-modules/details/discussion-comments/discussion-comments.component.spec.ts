import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscussionCommentsComponent } from './discussion-comments.component';

describe('DiscussionCommentsComponent', () => {
  let component: DiscussionCommentsComponent;
  let fixture: ComponentFixture<DiscussionCommentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscussionCommentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscussionCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
