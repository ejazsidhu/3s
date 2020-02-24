import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AsignmentDetailSingleAsseseeComponent } from './asignment-detail-single-assesee/asignment-detail-single-assesee.component';
import { AsessorsDetailViewComponent } from './asessors-detail-view/asessors-detail-view.component';
import { AsesseeDetailViewComponent } from './asessee-detail-view/asessee-detail-view.component';
import { CanDeactivateGuard } from './services/can-deactivate.guard';

const routes: Routes = [
  { path: '', redirectTo: 'huddle', pathMatch: 'full' },
  {
    path: 'huddle', component: HomeComponent,
    children: [
      { path: '',redirectTo:'details',pathMatch:'full'},
      { path: 'details', component: AsessorsDetailViewComponent,canDeactivate: [CanDeactivateGuard] },
      { path: 'my-asignment', component: AsesseeDetailViewComponent},
      { path: 'assignment/:id', component: AsignmentDetailSingleAsseseeComponent},
      

    ]
  },
  // { path: '', component: HomeComponent },
  // { path: 'asignment', redirectTo:'asignment',pathMatch:'full' },
  // { path: 'asignment', component: AsignmentDetailSingleAsseseeComponent },
  // { path: '**', redirectTo:'' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssessmentHuddleDetailsRoutingModule { }
