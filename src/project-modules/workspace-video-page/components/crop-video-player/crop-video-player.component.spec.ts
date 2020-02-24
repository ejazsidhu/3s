import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CropVideoPlayerComponent } from './crop-video-player.component';

describe('CropVideoPlayerComponent', () => {
  let component: CropVideoPlayerComponent;
  let fixture: ComponentFixture<CropVideoPlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CropVideoPlayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CropVideoPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
