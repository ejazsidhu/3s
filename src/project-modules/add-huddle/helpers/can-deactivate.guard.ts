import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { AssessmentHuddleFormComponent } from '../components';

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<AssessmentHuddleFormComponent> {

  canDeactivate(component?: AssessmentHuddleFormComponent): Observable<boolean> | boolean {
    if ((component.assessmentHuddleForm.dirty || component.isDirtyMoreSettingForm) && !component.assessmentHuddleForm.submitted) {
      if (confirm(component.translation.you_have_unsaved_changes)) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }
}