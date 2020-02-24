import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PcbreadcrumbsComponent } from './pcbreadcrumbs.component';

describe('PcbreadcrumbsComponent', () => {
  let component: PcbreadcrumbsComponent;
  let fixture: ComponentFixture<PcbreadcrumbsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PcbreadcrumbsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PcbreadcrumbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
