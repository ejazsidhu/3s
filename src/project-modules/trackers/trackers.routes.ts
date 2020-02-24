import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { AssessmentMainComponent } from './components/assessment-main/assessment-main.component';
import { CoachingMainComponent } from './components/coaching-main/coaching-main.component';
import { RootComponent } from './components';
import { SharedPageNotFoundComponent } from '../shared/shared-page-not-found/shared-page-not-found.component';

const routes: Routes = [
  { path: '', redirectTo: 'assessment', pathMatch: 'full' },
  {path: '',component:RootComponent,children:[
  { path: 'assessment', component: AssessmentMainComponent } ,
  { path: 'coaching', component: CoachingMainComponent }
  ]},
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
export class TrackersRoutes { }