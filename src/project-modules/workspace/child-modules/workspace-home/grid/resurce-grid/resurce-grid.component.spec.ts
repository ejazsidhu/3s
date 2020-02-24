import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResurceGridComponent } from './resurce-grid.component';

describe('ResurceGridComponent', () => {
  let component: ResurceGridComponent;
  let fixture: ComponentFixture<ResurceGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResurceGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResurceGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
