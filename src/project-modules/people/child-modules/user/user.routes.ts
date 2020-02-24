import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsersComponent } from './users/users.component';
import { PermissionComponent } from './permission/permission.component';

const routes: Routes = [
    {
        path: '',
        component: UsersComponent,
    },
    {
        path: 'permission/:account_id/:user_id/:role_id',
        component: PermissionComponent
    },
    // { path: '**', redirectTo: '' }
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserRoutes { }
