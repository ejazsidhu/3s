import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscussionLoadingComponent } from './discussion-loading.component';

describe('DiscussionLoadingComponent', () => {
  let component: DiscussionLoadingComponent;
  let fixture: ComponentFixture<DiscussionLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscussionLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscussionLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
