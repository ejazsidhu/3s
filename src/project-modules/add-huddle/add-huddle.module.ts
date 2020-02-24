import { NgModule } from '@angular/core';

import { __IMPORTS, __DECLARATIONS, __ENTRY_COMPONENTS, __PROVIDERS } from './components.barrel';
import { AddHuddleRoutes } from './add-huddle.routes';

import { SharedModule } from '../shared/shared.module';
import {DropdownModule} from 'primeng/dropdown';
import { LandingPageComponent } from './components/landing-page/landing-page.component';


@NgModule({
  declarations: [__DECLARATIONS, LandingPageComponent],
  imports: [__IMPORTS, AddHuddleRoutes,SharedModule,DropdownModule],
  providers: [__PROVIDERS],
  entryComponents: [__ENTRY_COMPONENTS]
})
export class AddHuddleModule { }
