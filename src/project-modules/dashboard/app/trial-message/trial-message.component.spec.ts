import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrialMessageComponent } from './trial-message.component';

describe('TrialMessageComponent', () => {
  let component: TrialMessageComponent;
  let fixture: ComponentFixture<TrialMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrialMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrialMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
