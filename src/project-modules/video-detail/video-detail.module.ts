import { NgModule } from '@angular/core';

import { __IMPORTS, __DECLARATIONS, __PROVIDERS } from './components.barrel';
import { VideoDetailRoutes } from './video-detail.routes';
import { SharedModule } from '../shared/shared.module';
import { UniquePipe } from './pipes/unique.pipe';
import { AngularAudioRecorderModule } from "@angular-audio-recorder/angular-audio-recorder.module";

@NgModule({
  declarations: [__DECLARATIONS, UniquePipe],
  imports: [__IMPORTS, VideoDetailRoutes,SharedModule, AngularAudioRecorderModule],
  providers: [__PROVIDERS],
})
export class VideoDetailModule { }
