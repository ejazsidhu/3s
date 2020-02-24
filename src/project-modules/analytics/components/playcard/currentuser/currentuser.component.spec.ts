import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentuserComponent } from './currentuser.component';

describe('CurrentuserComponent', () => {
  let component: CurrentuserComponent;
  let fixture: ComponentFixture<CurrentuserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentuserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentuserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
