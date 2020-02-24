import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreLoadingGridComponent } from './pre-loading-grid.component';

describe('PreLoadingGridComponent', () => {
  let component: PreLoadingGridComponent;
  let fixture: ComponentFixture<PreLoadingGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreLoadingGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreLoadingGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
