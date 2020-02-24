// import { CommonModule } from '@angular/common'; // Todo: high, lets see if angular 8 works without it
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
// import { LoadingBarModule } from '@ngx-loading-bar/core';
import { ToastrModule } from 'ngx-toastr';
import { TabsModule, ModalModule, BsDropdownModule, TooltipModule } from 'ngx-bootstrap';

import { BaseService } from "./services";

import {
  AppComponent, AppHeaderComponent, LogoAreaComponent, AccountInformationComponent, TrialMessageComponent, UserComponent,
  NavigationComponent, ImpersonationComponent, BreadcrumbsComponent
} from './components';

import { LanguageInterceptor } from "@projectModules/app/helpers";

export const __IMPORTS = [
  // CommonModule, // Todo: high, lets see if angular 8 works without it
  BrowserModule,
  BrowserAnimationsModule,
  FormsModule,
  HttpClientModule,
  LoadingBarHttpClientModule,
  // LoadingBarModule,
  ModalModule.forRoot(),
  BsDropdownModule.forRoot(),
  ToastrModule.forRoot(),
  TooltipModule.forRoot(),
  TabsModule.forRoot()
];

export const __DECLARATIONS = [
  AppComponent, AppHeaderComponent, LogoAreaComponent, AccountInformationComponent, TrialMessageComponent, UserComponent,
  NavigationComponent, ImpersonationComponent, BreadcrumbsComponent
];

export const __PROVIDERS = [
  BaseService,
  {
    provide: HTTP_INTERCEPTORS,
    useClass: LanguageInterceptor,
    multi: true
  }
]