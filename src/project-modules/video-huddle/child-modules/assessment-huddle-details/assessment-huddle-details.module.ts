import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AssessmentHuddleDetailsRoutingModule } from './assessment-huddle-details-routing.module';
import { HomeComponent } from './home/home.component';
import { ModalModule, BsDropdownModule, TooltipModule, CollapseModule } from 'ngx-bootstrap';
import { DetailsHttpService } from '../details/servic/details-http.service';
import { AsignmentDetailSingleAsseseeComponent } from './asignment-detail-single-assesee/asignment-detail-single-assesee.component';
import { AsessorsDetailViewComponent } from './asessors-detail-view/asessors-detail-view.component';
import { AsesseeDetailViewComponent } from './asessee-detail-view/asessee-detail-view.component';
import { HuddleParticipantsListComponent } from './huddle-participants-list/huddle-participants-list.component';
import { VideoThumbComponent } from './asessee-detail-view/video-thumb/video-thumb.component';
import { ResourcesThumbComponent } from './asessee-detail-view/resources-thumb/resources-thumb.component';
import {CanDeactivateGuard} from './services/can-deactivate.guard';
import { NgSlimScrollModule, SLIMSCROLL_DEFAULTS } from 'ngx-slimscroll';
// import { DetailsModule } from 'src/app/details/details.module';
// import { SafeHtmlPipe } from './services/safe-html.pipe';
import { SharedModule } from "../shared/shared.module";
import { DetailsModule } from '../details/details.module';
import { TreeModule } from 'angular-tree-component';


@NgModule({
  declarations: [HomeComponent, AsignmentDetailSingleAsseseeComponent, AsessorsDetailViewComponent, AsesseeDetailViewComponent, HuddleParticipantsListComponent, VideoThumbComponent, ResourcesThumbComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    AssessmentHuddleDetailsRoutingModule,
    NgSlimScrollModule,
    ModalModule.forRoot(),
     BsDropdownModule.forRoot(),
      TooltipModule.forRoot(), 
      CollapseModule.forRoot(),
       DetailsModule,
       TreeModule.forRoot(),
    
  ],
  providers: [{
    provide: SLIMSCROLL_DEFAULTS,
    useValue: {
      alwaysVisible : true
    }
  },DetailsHttpService,CanDeactivateGuard]
})
export class AssessmentHuddleDetailsModule { }
