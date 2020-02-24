import { NgModule } from '@angular/core';

import { __IMPORTS, __DECLARATIONS, __PROVIDERS } from './components.barrel';

import { AppRoutes } from './app.routes';

import { AppComponent } from './components';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SharedModule } from '../shared/shared.module';
import {PublicModule} from '../public/public.module'
import {DropdownModule} from 'primeng/dropdown';
@NgModule({
  declarations: [__DECLARATIONS, PageNotFoundComponent],
  imports: [__IMPORTS, AppRoutes,SharedModule,DropdownModule,PublicModule],
  providers: [__PROVIDERS],
  bootstrap: [AppComponent]
})
export class AppModule { }
