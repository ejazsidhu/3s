import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { AppHeaderComponent } from './app/app-header/app-header.component';
import { LogoAreaComponent } from './app/logo-area/logo-area.component';
import { AccountInformationComponent } from './app/account-information/account-information.component';
import { TrialMessageComponent } from './app/trial-message/trial-message.component';
import { UserComponent } from './app/user/user.component';
import { NavigationComponent } from './app/navigation/navigation.component';
import { ImpersonationComponent } from './app/impersonation/impersonation.component';
import { HomeComponent } from './app/home/home.component';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { TooltipModule, BsDropdownModule, ModalModule } from 'ngx-bootstrap';
import { DeviceDetectorModule } from 'ngx-device-detector';

import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { UserSettingsComponent } from './settings/user-settings/components/user-settings.component';

@NgModule({
  declarations: [
    AppHeaderComponent,
    LogoAreaComponent,
    AccountInformationComponent,
    TrialMessageComponent,
    UserComponent,
    NavigationComponent,
    ImpersonationComponent,
    HomeComponent,
    UserSettingsComponent
    
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    LoadingBarHttpClientModule,
    TooltipModule.forRoot(),
    DeviceDetectorModule.forRoot(),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    FormsModule,
    SharedModule
  ]
})
export class DashboardModule { }
