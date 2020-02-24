import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreSettingsComponent } from './more-settings.component';

describe('MoreSettingsComponent', () => {
  let component: MoreSettingsComponent;
  let fixture: ComponentFixture<MoreSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoreSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoreSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
