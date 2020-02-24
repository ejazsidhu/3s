import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoDiscussionComponent } from './no-discussion.component';

describe('NoDiscussionComponent', () => {
  let component: NoDiscussionComponent;
  let fixture: ComponentFixture<NoDiscussionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoDiscussionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoDiscussionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
