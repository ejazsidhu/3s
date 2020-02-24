import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { AsessorsDetailViewComponent } from '../asessors-detail-view/asessors-detail-view.component';

@Injectable({ providedIn: 'root' })
export class CanDeactivateGuard implements CanDeactivate<AsessorsDetailViewComponent> {

  canDeactivate(
    component?: AsessorsDetailViewComponent,
  ): Observable<boolean> | boolean {
    if (component.huddleData && component.huddleData.current_huddle_info && !component.isPublished) {
      if (confirm(component.translation.you_have_unsaved_changes)) {
        return true;
      } else {
        return false;
      }
    }

    return true;
  }
}