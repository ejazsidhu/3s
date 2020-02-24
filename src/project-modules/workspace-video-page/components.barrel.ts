import { CommonModule } from '@angular/common';
import { MomentModule } from 'ngx-moment';
import { ToastrModule } from 'ngx-toastr';
import { NouisliderModule } from 'ng2-nouislider';
import { UiSwitchModule } from 'ngx-toggle-switch'
import { DeviceDetectorModule } from 'ngx-device-detector';
import { AmChartsModule } from '@amcharts/amcharts3-angular';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';

import { TabsModule, ModalModule, TooltipModule, ButtonsModule, BsDropdownModule, BsDatepickerModule } from 'ngx-bootstrap';

import {
  RootComponent, BreadcrumbsComponent, VBodyComponent, VideoPlayerComponent, NotFoundComponent, CommentComponent,
  RubricsComponent, SearchFormComponent, CustomTagsComponent, FsUploaderComponent, CoachingSummaryComponent, VoBodyComponent,
  AddCommentComponent, CropVideoPlayerComponent,SyncNotesComponent
} from "./components";

import { InfoRedSVG } from "./svg-components";

import { SlimScroll } from "./directives";
import { CustomsearchPipe, DoubleDigitPipe } from "./pipes";

import { PlayerService, CropPlayerService, MainService, ScrollService,ObservationService } from './services';

export const __IMPORTS = [
  CommonModule,
  MomentModule,
  UiSwitchModule,
  AmChartsModule,
  NouisliderModule,
  LoadingBarHttpClientModule,
  TabsModule.forRoot(),
  ToastrModule.forRoot(),
  ModalModule.forRoot(),
  TooltipModule.forRoot(),
  ButtonsModule.forRoot(),
  BsDropdownModule.forRoot(),
  BsDatepickerModule.forRoot(),
  DeviceDetectorModule.forRoot(),

];

export const __DECLARATIONS = [
  RootComponent,
  BreadcrumbsComponent,
  VBodyComponent,
  VideoPlayerComponent,
  NotFoundComponent,
  CommentComponent,
  RubricsComponent,
  SearchFormComponent,
  CustomTagsComponent,
  FsUploaderComponent,
  CoachingSummaryComponent,
  VoBodyComponent,
  AddCommentComponent,
  CropVideoPlayerComponent,
  SlimScroll,
  CustomsearchPipe,
  SyncNotesComponent,
  InfoRedSVG,
  DoubleDigitPipe
];

export const __PROVIDERS = [PlayerService, CropPlayerService, MainService, ScrollService,ObservationService];