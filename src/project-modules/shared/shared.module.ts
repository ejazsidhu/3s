import { NgModule } from '@angular/core';

import { __IMPORTS, __DECLARATIONS } from './components.barrel';
import { SharedPageNotFoundComponent } from './shared-page-not-found/shared-page-not-found.component';
import { PublicAuthGuard } from './guards/public-auth.guard';


@NgModule({
  imports: [__IMPORTS],
  declarations: [__DECLARATIONS, SharedPageNotFoundComponent],
  exports: [__DECLARATIONS,SharedPageNotFoundComponent],
  
})
export class SharedModule { }
