import { NgModule } from '@angular/core';

import { __IMPORTS, __DECLARATIONS, __PROVIDERS } from './components.barrel';
import { AnalyticsRoutes } from './analytics.routes';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [__DECLARATIONS, ],
  imports: [__IMPORTS, AnalyticsRoutes,SharedModule],
  providers: [__PROVIDERS],
})
export class AnalyticsModule { }