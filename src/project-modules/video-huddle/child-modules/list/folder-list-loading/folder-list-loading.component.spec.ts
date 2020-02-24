import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderListLoadingComponent } from './folder-list-loading.component';

describe('FolderListLoadingComponent', () => {
  let component: FolderListLoadingComponent;
  let fixture: ComponentFixture<FolderListLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FolderListLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderListLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
