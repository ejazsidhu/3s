import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PctabsComponent } from './pctabs.component';

describe('PctabsComponent', () => {
  let component: PctabsComponent;
  let fixture: ComponentFixture<PctabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PctabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PctabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
