import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsessorsDetailViewComponent } from './asessors-detail-view.component';

describe('AsessorsDetailViewComponent', () => {
  let component: AsessorsDetailViewComponent;
  let fixture: ComponentFixture<AsessorsDetailViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsessorsDetailViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsessorsDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
