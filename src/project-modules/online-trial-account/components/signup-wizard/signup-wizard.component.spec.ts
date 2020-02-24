import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupWizardComponent } from './signup-wizard.component';

describe('SignupWizardComponent', () => {
  let component: SignupWizardComponent;
  let fixture: ComponentFixture<SignupWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignupWizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
