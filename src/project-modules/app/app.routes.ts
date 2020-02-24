import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { SharedPageNotFoundComponent } from '../shared/shared-page-not-found/shared-page-not-found.component';
import { PublicAuthGuard } from '../shared/guards/public-auth.guard';

const routerOptions: ExtraOptions = {
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled',
  scrollOffset: [0, 64],
};

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard_angular',
    pathMatch: 'full'
  },
  {
    path: 'video_huddles',
    loadChildren: './../video-huddle/video-huddle.module#VideoHuddleModule'
  },
  {
    path: 'video_details',
    loadChildren: './../video-page/video-page.module#VideoPageModule',
    data:{name:'video_page'}
  },
  {
    path: 'add_huddle_angular',
    loadChildren: './../add-huddle/add-huddle.module#AddHuddleModule'
  },
  {
    path: 'workspace',
    loadChildren: './../workspace/workspace.module#WorkspaceModule'
  },
  {
    path: 'workspace_video',
    loadChildren: './../video-page/video-page.module#VideoPageModule',
    data:{name:'workspace_video_page'}
    // loadChildren: './../workspace-video-page/workspace-video-page.module#WorkspaceVideoPageModule'
  },
  {
    path: 'analytics_angular',
    loadChildren: './../analytics/analytics.module#AnalyticsModule'
  },
  {
    path: 'online_trial_account',
    loadChildren: './../online-trial-account/online-trial-account.module#OnlineTrialAccountModule'
  },
  {
    path: 'trackers',
    loadChildren: './../trackers/trackers.module#TrackersModule'
  },
  {
    path: 'dashboard_angular',
    loadChildren: './../dashboard/dashboard.module#DashboardModule'
  }, {
    path: 'people',
    loadChildren: './../people/people.module#PeopleModule'
  },
  { path: 'page_not_found', component: SharedPageNotFoundComponent },

  {
    path: '**',
    redirectTo: 'page_not_found',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule],
  providers: [PublicAuthGuard]
})
export class AppRoutes { }
