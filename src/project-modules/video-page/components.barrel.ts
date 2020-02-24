import { CommonModule } from '@angular/common';
import { MomentModule } from 'ngx-moment';
import { NouisliderModule } from 'ng2-nouislider';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { AmChartsModule } from "@amcharts/amcharts3-angular";
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';

import {
  BsDropdownModule, TooltipModule, ButtonsModule, BsDatepickerModule, TabsModule, ModalModule
} from 'ngx-bootstrap';

import {
  PlayerService, CropPlayerService, MainService, ObservationService, ScrollService, VideoPageService
} from "./services";

import {
  RootComponent, BreadcrumbComponent, PageLoaderAnimationComponent, VBodyComponent, VideoPlayerComponent, NotFoundComponent, CommentComponent,
  SearchFormComponent, CustomTagsComponent, RubricsComponent, FsUploaderComponent, CoachingSummaryComponent, VoBodyComponent, AddCommentComponent,
  CropVideoPlayerComponent, ScriptedObservationComponent, 
  VideoAddCommentComponent, MainComponent, SeperateVideoPlayerComponent,
   CommentListComponent,VideoPageAttachmentsComponent,SyncNotesComponent
} from "./components";

import { CommentPlayOffSVG, CommentPlayOnSVG, InfoRedSVG } from "./svg-components";

import { CanDeactivateGuard } from "./helpers";

import { SlimScroll } from './directives';

import { CustomsearchPipe, DoubleDigitPipe } from './pipes';
import { LiveStreamingComponent } from './components/live-streaming/live-streaming.component';

export const __IMPORTS = [
  CommonModule,
  TooltipModule.forRoot(),
  BsDropdownModule.forRoot(),
  ButtonsModule.forRoot(),
  BsDatepickerModule.forRoot(),
  TabsModule.forRoot(),
  LoadingBarHttpClientModule,
  MomentModule,
  UiSwitchModule,
  ModalModule.forRoot(),
  AmChartsModule,
  NouisliderModule,
  DeviceDetectorModule.forRoot()
];

export const __DECLARATIONS = [
  RootComponent,
  BreadcrumbComponent,
  PageLoaderAnimationComponent,
  VBodyComponent,
  VideoPlayerComponent,
  NotFoundComponent,
  CommentComponent,
  SearchFormComponent,
  SlimScroll,
  CustomTagsComponent,
  RubricsComponent,
  FsUploaderComponent,
  CoachingSummaryComponent,
  VoBodyComponent,
  AddCommentComponent,
  CropVideoPlayerComponent,
  CustomsearchPipe,
  DoubleDigitPipe,
  ScriptedObservationComponent,
  CommentPlayOffSVG,
  CommentPlayOnSVG,
  InfoRedSVG,
  LiveStreamingComponent,
  VideoAddCommentComponent,
  MainComponent,
  SeperateVideoPlayerComponent,
  CommentListComponent,
  VideoPageAttachmentsComponent,
  SyncNotesComponent
];

export const __PROVIDERS = [
  PlayerService,
  CropPlayerService,
  MainService,
  ScrollService,
  ObservationService,
  CanDeactivateGuard,
  VideoPageService
];