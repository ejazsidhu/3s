import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TiltleComponent } from './tiltle.component';

describe('TiltleComponent', () => {
  let component: TiltleComponent;
  let fixture: ComponentFixture<TiltleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TiltleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TiltleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
