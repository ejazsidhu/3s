import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderThumbLoadingComponent } from './folder-thumb-loading.component';

describe('FolderThumbLoadingComponent', () => {
  let component: FolderThumbLoadingComponent;
  let fixture: ComponentFixture<FolderThumbLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FolderThumbLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderThumbLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
