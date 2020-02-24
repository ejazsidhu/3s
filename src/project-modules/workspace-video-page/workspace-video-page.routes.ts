import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RootComponent, VBodyComponent, VoBodyComponent, NotFoundComponent, SyncNotesComponent } from './components';
import { SharedPageNotFoundComponent } from '../shared/shared-page-not-found/shared-page-not-found.component';

const routes: Routes = [
  {
    path: '', component: RootComponent, children: [
      { path: 'home/:huddle_id/:video_id', component: VBodyComponent },
      { path: 'home/:huddle_id/:video_id/:init_crop', component: VBodyComponent },
      // { path: 'video_observation/:huddle_id/:video_id', component: VoBodyComponent },
      { path: 'video_observation/:huddle_id/:video_id', component: SyncNotesComponent },

      { path: 'scripted_observations/:huddle_id/:video_id', component: VoBodyComponent },
      
    ]
  },
  { path: 'page_not_found', component: SharedPageNotFoundComponent },

  { path: '', redirectTo: 'page_not_found', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspaceVideoPageRoutes { }