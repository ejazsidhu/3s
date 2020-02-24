import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GridComponent } from './grid/grid.component';
import { ListComponent } from './list/list.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home',
   component: HomeComponent,
   children:[
    { path: '', redirectTo: 'grid', pathMatch: 'full' },
    { path: 'grid', component: GridComponent },
    { path: 'list', component: ListComponent },

   ]
   },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspaceHomeRoutingModule { }
