import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HuddleListViewComponent } from './huddle-list-view.component';

describe('HuddleListViewComponent', () => {
  let component: HuddleListViewComponent;
  let fixture: ComponentFixture<HuddleListViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HuddleListViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HuddleListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
