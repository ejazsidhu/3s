import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharepopupComponent } from './sharepopup.component';

describe('SharepopupComponent', () => {
  let component: SharepopupComponent;
  let fixture: ComponentFixture<SharepopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharepopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharepopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
