import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkspaceHomeRoutingModule } from './workspace-home-routing.module';
import { HomeComponent } from './home/home.component';
import { GridComponent } from './grid/grid.component';
import { ResurceGridComponent } from './grid/resurce-grid/resurce-grid.component';
import { PreLoadingGridComponent } from './grid/pre-loading-grid/pre-loading-grid.component';
import { VideoGridComponent } from './grid/video-grid/video-grid.component';
import { ScriptedNotesGridComponent } from './grid/scripted-notes-grid/scripted-notes-grid.component';
import { ListComponent } from './list/list.component';
import { ScriptedNotesListComponent } from './list/scripted-notes-list/scripted-notes-list.component';
import { VideoListComponent } from './list/video-list/video-list.component';
import { PreLoadingListComponent } from './list/pre-loading-list/pre-loading-list.component';
import { ResurceListComponent } from './list/resurce-list/resurce-list.component';
import { SharepopupComponent } from './sharepopup/sharepopup.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap'
import { FormsModule } from '@angular/forms';
import { RangeSliderModule } from 'ngx-rangeslider-component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { NgSlimScrollModule, SLIMSCROLL_DEFAULTS } from 'ngx-slimscroll';
import { OrderModule } from 'ngx-order-pipe';
//FS Directive
import { FSUploaderDirective } from './directives'
import { ToastrModule } from 'ngx-toastr';
import { SearchPipe } from './pipes/search.pipe';

import { SocketService } from '@app/services';
import { FilestackService, PermissionsService, WorkspaceHttpService } from "./services";


@NgModule({
  declarations: [
    HomeComponent,
    GridComponent,
    ResurceGridComponent,
    PreLoadingGridComponent,
    VideoGridComponent,
    ScriptedNotesGridComponent,
    ListComponent,
    ScriptedNotesListComponent,
    VideoListComponent,
    PreLoadingListComponent,
    ResurceListComponent,
    SharepopupComponent,
    FSUploaderDirective,
    SearchPipe
  ],

  imports: [
    CommonModule, FormsModule,
    WorkspaceHomeRoutingModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    FormsModule,
    RangeSliderModule,
    ToastrModule.forRoot(),
    NgSlimScrollModule,
    OrderModule
  ],
  providers: [
    FilestackService, PermissionsService, SocketService, WorkspaceHttpService,
    {
      provide: SLIMSCROLL_DEFAULTS,
      useValue: {
        alwaysVisible: false
      }
    },
  ],
})
export class WorkspaceHomeModule { }
