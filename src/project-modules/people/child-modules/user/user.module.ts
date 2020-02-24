import { NgModule } from '@angular/core';

import { __IMPORTS, __DECLARATIONS, __PROVIDERS } from "./components.barrel";

import { UserRoutes } from "./user.routes";
import { UniqueUserPipe } from './pipe/unique-user.pipe';

@NgModule({
  imports: [__IMPORTS, UserRoutes],
  declarations: [__DECLARATIONS, UniqueUserPipe],
  providers: [__PROVIDERS]
})
export class UserModule { }
