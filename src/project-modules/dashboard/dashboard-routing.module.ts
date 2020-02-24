import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './app/home/home.component';
import { SharedPageNotFoundComponent } from '../shared/shared-page-not-found/shared-page-not-found.component';
import { UserSettingsComponent } from './settings/user-settings/components/user-settings.component';

const routes: Routes = [
  { path: '',redirectTo:'home',pathMatch:'full' },
  { path: 'home', component: HomeComponent },
  { path: 'user_edit', component: UserSettingsComponent },
  {path:'page_not_found',component:SharedPageNotFoundComponent},
  
  {
    path: '**',
    redirectTo: 'page_not_found'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
