import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsnplsComponent } from './tagsnpls.component';

describe('TagsnplsComponent', () => {
  let component: TagsnplsComponent;
  let fixture: ComponentFixture<TagsnplsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagsnplsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsnplsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
