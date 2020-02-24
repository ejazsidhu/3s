import { NgModule } from '@angular/core';

import { __IMPORTS, __DECLARATIONS, __PROVIDERS } from './components.barrel';
import { VideoPageRoutes } from './video-page.routes';
// import { SharedModule } from '../shared/shared.module';
import { UniquePipe } from './pipes/unique.pipe';
import { AngularAudioRecorderModule } from "@angular-audio-recorder/angular-audio-recorder.module";
import { PerformanceLevelComponent } from './components/performance-level/performance-level.component';
import { SerachFormSyncNotesComponent } from './components/serach-form-sync-notes/serach-form-sync-notes.component';

@NgModule({
  declarations: [__DECLARATIONS, UniquePipe, PerformanceLevelComponent, SerachFormSyncNotesComponent ],
  imports: [__IMPORTS, VideoPageRoutes, AngularAudioRecorderModule],
  // imports: [__IMPORTS, VideoPageRoutes,SharedModule, AngularAudioRecorderModule],
  providers: [__PROVIDERS],
})
export class VideoPageModule { }
