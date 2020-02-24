import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderThumbViewComponent } from './folder-thumb-view.component';

describe('FolderThumbViewComponent', () => {
  let component: FolderThumbViewComponent;
  let fixture: ComponentFixture<FolderThumbViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FolderThumbViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderThumbViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
