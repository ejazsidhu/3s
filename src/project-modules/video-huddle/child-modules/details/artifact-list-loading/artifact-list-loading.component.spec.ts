import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtifactListLoadingComponent } from './artifact-list-loading.component';

describe('ArtifactListLoadingComponent', () => {
  let component: ArtifactListLoadingComponent;
  let fixture: ComponentFixture<ArtifactListLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtifactListLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtifactListLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
