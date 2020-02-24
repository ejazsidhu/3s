import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RubricsComponent } from './rubrics.component';

describe('RubricsComponent', () => {
  let component: RubricsComponent;
  let fixture: ComponentFixture<RubricsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RubricsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RubricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
