import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { ToastrModule } from 'ngx-toastr';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { QuillModule } from 'ngx-quill';


import {
  BsDropdownModule, TooltipModule, ButtonsModule, BsDatepickerModule, TabsModule, ModalModule, TypeaheadModule, AlertModule
} from 'ngx-bootstrap';

import { MainService } from "./services";
import { CanDeactivateGuard } from "./helpers";

import {

  RootComponent, BreadcrumbsComponent, MainComponent, 
  AssessmentHuddleFormComponent,AssessmentHuddleNewUserComponent,MoreSettingsDialogComponent, CoachingHuddleComponent, 
  CollaborationHuddleComponent, HuddleTypeComponent,
  MoreSettingsComponent, NewUserComponent,AddHuddleComponent,AddCollaborationComponent,
  AddAssessmentComponent
} from "./components";

export const __IMPORTS = [
  CommonModule,
  FormsModule,
  LoadingBarHttpClientModule,
  MomentModule,
  UiSwitchModule,
  TooltipModule.forRoot(),
  BsDropdownModule.forRoot(),
  ButtonsModule.forRoot(),
  BsDatepickerModule.forRoot(),
  TabsModule.forRoot(),
  ToastrModule.forRoot(),
  ModalModule.forRoot(),
  TypeaheadModule.forRoot(),
  AlertModule.forRoot(),
  QuillModule
];



export const __DECLARATIONS = [
  RootComponent,
  BreadcrumbsComponent,
  MainComponent,
  AssessmentHuddleFormComponent,
  CoachingHuddleComponent,
  CollaborationHuddleComponent,
  HuddleTypeComponent,
  MoreSettingsComponent,
  NewUserComponent,
  AddHuddleComponent,
  AddCollaborationComponent,
  AddAssessmentComponent,
  AssessmentHuddleNewUserComponent,
  MoreSettingsDialogComponent
];

export const __ENTRY_COMPONENTS = [
  MoreSettingsDialogComponent
];
export const __PROVIDERS = [
  MainService,
  CanDeactivateGuard
];