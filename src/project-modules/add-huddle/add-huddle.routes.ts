import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RootComponent, MainComponent, AddHuddleComponent, AddCollaborationComponent, AssessmentHuddleFormComponent } from './components';
import { CanDeactivateGuard } from "./helpers";
import { GLOBAL_CONSTANTS } from '@src/constants/constant';
import { SharedPageNotFoundComponent } from '../shared/shared-page-not-found/shared-page-not-found.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: '', component: RootComponent, children: [
      { path: 'home', component: LandingPageComponent },
      { path: 'coaching', component: AddHuddleComponent },
      // { path: 'assessment-huddle', component: AssessmentHuddleFormComponent, data: { pageMode: GLOBAL_CONSTANTS.PAGE_MODE.ADD } }, // TODO: normal, have to implement child routes
      // { path: 'assessment-huddle/edit/:huddleId', component: AssessmentHuddleFormComponent, data: { pageMode: GLOBAL_CONSTANTS.PAGE_MODE.EDIT } }, // TODO: normal, have to implement child routes
      { path: 'assessment', component: AssessmentHuddleFormComponent, canDeactivate: [CanDeactivateGuard], data: { pageMode: GLOBAL_CONSTANTS.PAGE_MODE.ADD } }, // TODO: normal, have to implement child routes
      { path: 'assessment/edit/:huddleId', component: AssessmentHuddleFormComponent, canDeactivate: [CanDeactivateGuard], data: { pageMode: GLOBAL_CONSTANTS.PAGE_MODE.EDIT } }, // TODO: normal, have to implement child routes
     
      // { path: 'assessment', component: AddAssessmentComponent },
      { path: 'collaboration', component: AddCollaborationComponent },
      // { path: 'home/:folder_id', component: MainComponent },
      { path: 'edit/:huddle_id', component: MainComponent }
    ]
  },
  { path: 'page_not_found', component: SharedPageNotFoundComponent },

  {
    path: '**',
    redirectTo: 'page_not_found',
    pathMatch:'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],

  exports: [RouterModule]
})
export class AddHuddleRoutes { }