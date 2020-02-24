import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { VoBodyComponent } from '@videoPage/components';

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<VoBodyComponent> {

    canDeactivate(component?: VoBodyComponent): Observable<boolean> | boolean {
        if (component.options.timerStarted && !component.options.script_published) {
            if (confirm("Changes you made may not be saved.")) {
                return true;
            } else {
                return false;
            }
        } else return true;
    }
}