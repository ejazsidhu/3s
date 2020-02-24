import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtifactThumbLoadingComponent } from './artifact-thumb-loading.component';

describe('ArtifactThumbLoadingComponent', () => {
  let component: ArtifactThumbLoadingComponent;
  let fixture: ComponentFixture<ArtifactThumbLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtifactThumbLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtifactThumbLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
