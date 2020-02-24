import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreLoadingListComponent } from './pre-loading-list.component';

describe('PreLoadingListComponent', () => {
  let component: PreLoadingListComponent;
  let fixture: ComponentFixture<PreLoadingListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreLoadingListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreLoadingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
