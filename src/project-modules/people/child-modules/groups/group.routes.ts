import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GroupListComponent } from './group-list/group-list.component';

const routes: Routes = [
    {
        path: '',
        component: GroupListComponent,
    },
    { path: '**', redirectTo: '' }
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GroupRoutes { }
