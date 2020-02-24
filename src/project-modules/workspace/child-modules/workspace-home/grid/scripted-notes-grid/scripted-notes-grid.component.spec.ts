import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptedNotesGridComponent } from './scripted-notes-grid.component';

describe('ScriptedNotesGridComponent', () => {
  let component: ScriptedNotesGridComponent;
  let fixture: ComponentFixture<ScriptedNotesGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScriptedNotesGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptedNotesGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
