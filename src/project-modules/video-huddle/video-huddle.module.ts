import { NgModule } from '@angular/core';

import { __IMPORTS, __DECLARATIONS, __PROVIDERS } from './components.barrel';
import { VideoHuddleRoutes } from './video-huddle.routes';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [__DECLARATIONS],
  imports: [__IMPORTS, VideoHuddleRoutes,SharedModule],
  providers: [__PROVIDERS],
})
export class VideoHuddleModule { }
