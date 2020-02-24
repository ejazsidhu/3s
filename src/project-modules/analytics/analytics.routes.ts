import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RootComponent, BodyComponent, PlaycardComponent, UserdetailsComponent } from './components';
import { SharedPageNotFoundComponent } from '../shared/shared-page-not-found/shared-page-not-found.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: '', component: RootComponent, children: [
      { path: 'home', component: BodyComponent },
      { path: 'home/:tab_id', component: BodyComponent },
      { path: 'playcard/:account_id/:user_id/:start_date/:end_date/:folder_type', component: PlaycardComponent },
      { path: 'details/:user_id/:account_id/:start_date/:end_date/:type/:workspace_huddle_library', component: UserdetailsComponent }
    ]
  },
  {path:'page_not_found',component:SharedPageNotFoundComponent},
  
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
export class AnalyticsRoutes { }