import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsertagsComponent } from './usertags.component';

describe('UsertagsComponent', () => {
  let component: UsertagsComponent;
  let fixture: ComponentFixture<UsertagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsertagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsertagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
