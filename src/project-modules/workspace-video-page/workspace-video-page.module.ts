import { NgModule } from '@angular/core';

import { __IMPORTS, __DECLARATIONS, __PROVIDERS } from './components.barrel';
import { WorkspaceVideoPageRoutes } from './workspace-video-page.routes';
import { SharedModule } from '../shared/shared.module';
import { AngularAudioRecorderModule } from "@angular-audio-recorder/angular-audio-recorder.module";

@NgModule({
  declarations: [__DECLARATIONS],
  imports: [__IMPORTS, WorkspaceVideoPageRoutes, SharedModule, AngularAudioRecorderModule],
  providers: [__PROVIDERS],
})
export class WorkspaceVideoPageModule { }