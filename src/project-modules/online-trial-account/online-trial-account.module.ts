import { NgModule } from '@angular/core';

import { __IMPORTS, __DECLARATIONS, __PROVIDERS } from './components.barrel';
import { OnlineTrialAccountRoutes } from './online-trial-account.routes';

@NgModule({
  declarations: [__DECLARATIONS],
  imports: [__IMPORTS, OnlineTrialAccountRoutes],
  providers: [__PROVIDERS],
})
export class OnlineTrialAccountModule { }
