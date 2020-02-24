import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RootComponent } from './components';
import { SharedPageNotFoundComponent } from '../shared/shared-page-not-found/shared-page-not-found.component';

const routes: Routes = [
  { path: '', redirectTo: 'workspace', pathMatch: 'full' },
  {
    path: '', component: RootComponent, children: [
      { path: 'workspace', loadChildren: './child-modules/workspace-home/workspace-home.module#WorkspaceHomeModule' }
    ]
  },
  { path: 'page_not_found', component: SharedPageNotFoundComponent },

  { path: '**', redirectTo: 'page_not_found',pathMatch:'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspaceRoutes { }