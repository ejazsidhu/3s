import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsesseeDetailViewComponent } from './asessee-detail-view.component';

describe('AsesseeDetailViewComponent', () => {
  let component: AsesseeDetailViewComponent;
  let fixture: ComponentFixture<AsesseeDetailViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsesseeDetailViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsesseeDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
