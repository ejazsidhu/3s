import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptedNotesListComponent } from './scripted-notes-list.component';

describe('ScriptedNotesListComponent', () => {
  let component: ScriptedNotesListComponent;
  let fixture: ComponentFixture<ScriptedNotesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScriptedNotesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptedNotesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
