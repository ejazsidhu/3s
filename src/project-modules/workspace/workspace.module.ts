import { NgModule } from '@angular/core';

import { __IMPORTS, __DECLARATIONS, __PROVIDERS } from './components.barrel';
import { WorkspaceRoutes } from './workspace.routes';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [__DECLARATIONS],
  imports: [__IMPORTS, WorkspaceRoutes,SharedModule],
  providers: [__PROVIDERS],
})
export class WorkspaceModule { }
