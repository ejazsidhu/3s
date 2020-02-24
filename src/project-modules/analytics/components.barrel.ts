import { CommonModule } from '@angular/common';
import { MomentModule } from 'ngx-moment';
import { ToastrModule } from 'ngx-toastr';
import {DataTableModule} from 'primeng/datatable';
import { PaginatorModule } from 'primeng/paginator';
import { NgxPaginationModule } from 'ngx-pagination';
import { AmChartsModule } from '@amcharts/amcharts3-angular';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';

import { TabsModule, ModalModule, TooltipModule, ButtonsModule, BsDropdownModule, BsDatepickerModule } from 'ngx-bootstrap';

import {
  RootComponent,
  ChartComponent,
  BodyComponent,
  BreadcrumbsComponent,
  OverviewComponent,
  TagsnplsComponent,
  UserSummaryComponent,
  NavtabsComponent,
  PlaycardComponent,
  PcbreadcrumbsComponent,
  PcBodyComponent,
  PctabsComponent,
  OverviewboxComponent,
  CurrentuserComponent,
  UsertagsComponent,
  UserdetailsComponent,
  UdbreadcrumbsComponent,
  UdBodyComponent
} from "./components";


import { OverviewService, BodyService, TabsService, SummaryService, PlaycardService, TagsService, DetailsService } from './services';

export const __IMPORTS = [
  CommonModule,

  TooltipModule.forRoot(),
  BsDropdownModule.forRoot(),
  ButtonsModule.forRoot(),
  AmChartsModule,
  DataTableModule,
  PaginatorModule,
  NgMultiSelectDropDownModule.forRoot(),
  BsDatepickerModule.forRoot(),
  ModalModule.forRoot(),
  TabsModule.forRoot(),
  ToastrModule.forRoot(),
  LoadingBarHttpClientModule,
  MomentModule,
  NgxPaginationModule
];

export const __DECLARATIONS = [
  RootComponent,
  ChartComponent,
  BodyComponent,
  BreadcrumbsComponent,
  OverviewComponent,
  TagsnplsComponent,
  UserSummaryComponent,
  NavtabsComponent,
  PlaycardComponent,
  PcbreadcrumbsComponent,
  PcBodyComponent,
  PctabsComponent,
  OverviewboxComponent,
  CurrentuserComponent,
  UsertagsComponent,
  UserdetailsComponent,
  UdbreadcrumbsComponent,
  UdBodyComponent
];

export const __PROVIDERS = [OverviewService, BodyService, TabsService, SummaryService, PlaycardService, TagsService, DetailsService];