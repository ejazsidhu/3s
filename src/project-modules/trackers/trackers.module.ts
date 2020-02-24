import { NgModule } from '@angular/core';

import { __IMPORTS, __DECLARATIONS, __PROVIDERS } from './components.barrel';
import { TrackersRoutes } from '../trackers/trackers.routes';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [__DECLARATIONS],
  imports: [__IMPORTS, TrackersRoutes,SharedModule],
  providers: [__PROVIDERS],
})
export class TrackersModule { }
