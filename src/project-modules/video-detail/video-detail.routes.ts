import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RootComponent, VBodyComponent, VoBodyComponent, ScriptedObservationComponent, LiveStreamingComponent, POCComponent } from './components';
import { CanDeactivateGuard } from "./helpers";
import { SharedPageNotFoundComponent } from '../shared/shared-page-not-found/shared-page-not-found.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: '', component: RootComponent, children: [
      { path: 'home/:huddle_id/:video_id', component: VBodyComponent },
      { path: 'poc/:huddle_id/:video_id', component: POCComponent },
      { path: 'home/:huddle_id/:video_id/:init_crop', component: VBodyComponent },
      { path: 'video_observation/:huddle_id/:video_id', component: VoBodyComponent },
      { path: 'live-streaming/:huddle_id/:video_id', component: LiveStreamingComponent },
      { path: 'scripted_observations/:huddle_id/:video_id', component: VoBodyComponent, canDeactivate: [CanDeactivateGuard] },

      // { path: 'scripted_observations_old/:huddle_id/:video_id', component: VoBodyComponent },
      // { path: 'scripted_observations/:huddle_id/:video_id', component: ScriptedObservationComponent },
      // { path: 'home/:huddle_id/:video_id', component: ScriptedObservationComponent },
    ]
  },
  { path: 'page_not_found', component: SharedPageNotFoundComponent },

  { path: '**', redirectTo: 'page_not_found',pathMatch:'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VideoDetailRoutes { }