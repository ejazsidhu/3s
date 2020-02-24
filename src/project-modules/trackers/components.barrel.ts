import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { ToastrModule } from 'ngx-toastr';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { CarouselModule } from 'ngx-owl-carousel-o';
import {
  BsDropdownModule, TooltipModule, ButtonsModule, BsDatepickerModule, TabsModule, ModalModule, TypeaheadModule, AlertModule
,SortableModule} from 'ngx-bootstrap';

import { MainService } from "./services";

import {
  AssessmentMainComponent,CoachingMainComponent,
  AssessmentDetailComponent,
  CoachingDetailComponent,RootComponent
  } from "./components";

import {NgxPaginationModule} from 'ngx-pagination';
import { DndModule } from 'ngx-drag-drop';
import { NgSlimScrollModule, SLIMSCROLL_DEFAULTS } from 'ngx-slimscroll';
import { SearchPipe } from './pipe/search.pipe';
import { AmChartsModule } from '@amcharts/amcharts3-angular';
import { OrderModule } from 'ngx-order-pipe';
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
  SortableModule.forRoot(),
  NgxPaginationModule,
  CarouselModule,
  DndModule,
  NgSlimScrollModule,
  AmChartsModule,
  OrderModule
];



export const __DECLARATIONS = [
  RootComponent,
  AssessmentMainComponent,
  CoachingMainComponent,
  AssessmentDetailComponent,
  CoachingDetailComponent,
  SearchPipe
];

export const __PROVIDERS = [
  MainService,
    { provide: SLIMSCROLL_DEFAULTS, useValue: { alwaysVisible: true } }
];