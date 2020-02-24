import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UdbreadcrumbsComponent } from './udbreadcrumbs.component';

describe('UdbreadcrumbsComponent', () => {
  let component: UdbreadcrumbsComponent;
  let fixture: ComponentFixture<UdbreadcrumbsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UdbreadcrumbsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UdbreadcrumbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
