import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewboxComponent } from './overviewbox.component';

describe('OverviewboxComponent', () => {
  let component: OverviewboxComponent;
  let fixture: ComponentFixture<OverviewboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverviewboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
