import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { RootComponent } from './components/root/root.component'
import { SharedPageNotFoundComponent } from '../shared/shared-page-not-found/shared-page-not-found.component';

const routes: Routes = [
  { path: '', redirectTo: 'home/people', pathMatch: 'full' },
  {
    path: 'home',
    component: RootComponent, children: [
      { path: '', redirectTo: 'people', pathMatch: 'full' },
      {
        path: 'people',
        loadChildren: './child-modules/user/user.module#UserModule',
      },
      {
        path: 'groups',
        loadChildren: './child-modules/groups/groups.module#GroupsModule'
      },
    ]
  },
  { path: 'page_not_found', component: SharedPageNotFoundComponent },
  { path: '**', redirectTo: 'page_not_found', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],

  exports: [RouterModule]
})
export class PeopleRoutes { }
