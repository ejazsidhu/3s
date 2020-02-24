import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DetailsRoutingModule } from "./details-routing.module";
import { HomeComponent } from "./home/home.component";
import { VideoHuddleDetailsGridViewComponent } from "./grid-view/grid-view.component";
import { ListViewComponent } from "./list-view/list-view.component";
import { BsDropdownModule } from "ngx-bootstrap";
import { RangeSliderModule } from "ngx-rangeslider-component";
import { QuillModule } from "ngx-quill";
import { NgSlimScrollModule, SLIMSCROLL_DEFAULTS } from 'ngx-slimscroll';
import { HttpClientModule } from "@angular/common/http";
import { VideoThumbComponent } from "./grid-view/video-thumb/video-thumb.component";
import { ResourcesThumbComponent } from "./grid-view/resources-thumb/resources-thumb.component";
import { ResourcesListComponent } from "./list-view/resources-list/resources-list.component";
import { VideoListComponent } from "./list-view/video-list/video-list.component";
import { TiltleComponent } from "./tiltle/tiltle.component";
import { TabsModule } from "ngx-bootstrap";
import { DiscussionsComponent } from "./discussions/discussions.component";
import { ScriptedNotesComponent } from "./grid-view/scripted-notes/scripted-notes.component";

import { FormsModule } from "@angular/forms";
import { SharedPopupModelsComponent } from './shared-popup-models/shared-popup-models.component';
import { ModalModule } from "ngx-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { CustomFormsModule } from "ng2-validation";
import { ArtifactThumbLoadingComponent } from "./artifact-thumb-loading/artifact-thumb-loading.component";
import { ArtifactListLoadingComponent } from "./artifact-list-loading/artifact-list-loading.component";
import { DiscussionLoadingComponent } from "./discussion-loading/discussion-loading.component";

import { FSUploaderDirective } from "@videoHuddle/directives";
import { ScriptedNotesListComponent } from "./list-view/scripted-notes-list/scripted-notes-list.component";
import { DiscussionDetailsComponent } from "./discussion-details/discussion-details.component";
import { DiscussionListComponent } from "./discussion-list/discussion-list.component";
import { DiscussionCommentsComponent } from "./discussion-comments/discussion-comments.component";
import { SingleDiscussionComponent } from "./single-discussion/single-discussion.component";
import { SearchPipe } from "./pipes/search.pipe";
import {OrderModule} from "ngx-order-pipe";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { NoDiscussionComponent } from './no-discussion/no-discussion.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DiscussionSenitizePipe } from './discussion-senitize.pipe';
import { DiscussionSenitizationDirective } from './discussion-senitization.directive';
// import { SafeHtmlPipe } from '../assessment-huddle-details/services/safe-html.pipe';
import { HtmlSenitizationPipe } from './pipes/html-senitization.pipe';
// import { AssessmentHuddleDetailsModule } from "../assessment-huddle-details/assessment-huddle-details.module";
import { SharedModule } from "@videoHuddle/child-modules/shared/shared.module";
import { TreeModule } from 'angular-tree-component';
import { ConferencingComponent } from './conferencing/conferencing.component';
@NgModule({
  declarations: [
    HomeComponent,
    VideoHuddleDetailsGridViewComponent,
    ListViewComponent,
    VideoThumbComponent,
    ResourcesThumbComponent,
    ResourcesListComponent,
    VideoListComponent,
    TiltleComponent,
    DiscussionsComponent,
    ScriptedNotesComponent,
    SharedPopupModelsComponent,
    ArtifactThumbLoadingComponent,
    ArtifactListLoadingComponent,
    DiscussionLoadingComponent,
    ScriptedNotesListComponent,
    FSUploaderDirective,
    DiscussionDetailsComponent,
    DiscussionListComponent,
    DiscussionCommentsComponent,
    SingleDiscussionComponent,
    ConferencingComponent,
    SearchPipe,
    NoDiscussionComponent,
    DiscussionSenitizePipe,
    DiscussionSenitizationDirective,
    //SafeHtmlPipe,
    HtmlSenitizationPipe,
  ],
  providers: [
    {
      provide: SLIMSCROLL_DEFAULTS,
      useValue: {
        alwaysVisible : false
      }
    },
  ],
  imports: [
    CommonModule,
    DetailsRoutingModule,
    HttpClientModule,
    TabsModule.forRoot(),
    BsDropdownModule.forRoot(),
    FormsModule,
    SharedModule,
    // SafeHtmlPipe,
    // AssessmentHuddleDetailsModule,
    ModalModule.forRoot(),
    ToastrModule.forRoot(),
    CustomFormsModule,
    TooltipModule.forRoot(),
    RangeSliderModule,
    QuillModule.forRoot({
      modules: {
        toolbar: [
          [{ font: [] }],
          ["bold", "italic", "underline", { color: [] }],
          ["link", "image", "video"],
          [{ list: "ordered" }, { list: "bullet" }]
        ]
      }
    }),
    OrderModule,
    Ng2SearchPipeModule,
    NgSlimScrollModule,
    TreeModule.forRoot(),

  ],
  exports:[SharedPopupModelsComponent, FSUploaderDirective]
})
export class DetailsModule {}
