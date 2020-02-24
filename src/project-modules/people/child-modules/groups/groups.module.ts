import { NgModule } from '@angular/core';

import { __IMPORTS, __DECLARATIONS, __PROVIDERS } from "./components.barrel";
import { GroupRoutes } from "./group.routes";

@NgModule({
  imports: [__IMPORTS, GroupRoutes],
  declarations: [__DECLARATIONS],
  providers: [__PROVIDERS]
})
export class GroupsModule { }
