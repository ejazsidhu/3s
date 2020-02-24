import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsUploaderComponent } from './fs-uploader.component';

describe('FsUploaderComponent', () => {
  let component: FsUploaderComponent;
  let fixture: ComponentFixture<FsUploaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsUploaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
