import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResurceListComponent } from './resurce-list.component';

describe('ResurceListComponent', () => {
  let component: ResurceListComponent;
  let fixture: ComponentFixture<ResurceListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResurceListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResurceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
