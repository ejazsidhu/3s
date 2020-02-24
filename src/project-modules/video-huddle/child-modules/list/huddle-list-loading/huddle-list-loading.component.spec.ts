import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HuddleListLoadingComponent } from './huddle-list-loading.component';

describe('HuddleListLoadingComponent', () => {
  let component: HuddleListLoadingComponent;
  let fixture: ComponentFixture<HuddleListLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HuddleListLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HuddleListLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
