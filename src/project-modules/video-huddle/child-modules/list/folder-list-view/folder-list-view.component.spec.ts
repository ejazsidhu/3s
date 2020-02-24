import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderListViewComponent } from './folder-list-view.component';

describe('FolderListViewComponent', () => {
  let component: FolderListViewComponent;
  let fixture: ComponentFixture<FolderListViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FolderListViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
