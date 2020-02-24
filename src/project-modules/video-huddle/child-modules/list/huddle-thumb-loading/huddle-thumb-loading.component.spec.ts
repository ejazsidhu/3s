import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HuddleThumbLoadingComponent } from './huddle-thumb-loading.component';

describe('HuddleThumbLoadingComponent', () => {
  let component: HuddleThumbLoadingComponent;
  let fixture: ComponentFixture<HuddleThumbLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HuddleThumbLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HuddleThumbLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
