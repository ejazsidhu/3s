import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RootComponent } from './components';
import { SharedPageNotFoundComponent } from '../shared/shared-page-not-found/shared-page-not-found.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: '', component: RootComponent, children: [
      {
        path: 'assessment/:id',
        loadChildren: './child-modules/assessment-huddle-details/assessment-huddle-details.module#AssessmentHuddleDetailsModule'
      },

      {
        path: 'huddle/details/:id',
        loadChildren: './child-modules/details/details.module#DetailsModule'
      },

      {
        path: 'list',
        loadChildren: './child-modules/list/list.module#ListModule'
      },
      {
        path: 'list/:folder_id',
        loadChildren: './child-modules/list/list.module#ListModule'
      },
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
export class VideoHuddleRoutes { }