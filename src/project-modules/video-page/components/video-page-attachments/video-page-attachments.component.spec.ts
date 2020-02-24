import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoPageAttachmentsComponent } from './video-page-attachments.component';

describe('VideoPageAttachmentsComponent', () => {
  let component: VideoPageAttachmentsComponent;
  let fixture: ComponentFixture<VideoPageAttachmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoPageAttachmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoPageAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
