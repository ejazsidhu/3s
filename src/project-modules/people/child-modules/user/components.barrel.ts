import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { PaginationModule, TooltipModule } from 'ngx-bootstrap';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSlimScrollModule, SLIMSCROLL_DEFAULTS } from 'ngx-slimscroll';
import { OrderModule } from 'ngx-order-pipe';

import { PeopleHttpService } from "@people/services";

import { UsersComponent } from './users/users.component';
import { PermissionComponent } from './permission/permission.component';
import { SearchPipe } from './pipe/search.pipe';

export const __IMPORTS = [
    CommonModule,
    ModalModule.forRoot(),
    FormsModule,
    ToastrModule.forRoot(),
    PaginationModule.forRoot(),
    Ng2SearchPipeModule,
    NgxPaginationModule,
    RouterModule,
    TooltipModule,
    NgSlimScrollModule,
    OrderModule];

export const __DECLARATIONS = [UsersComponent, PermissionComponent, SearchPipe];

export const __PROVIDERS = [
    PeopleHttpService,
    { provide: SLIMSCROLL_DEFAULTS, useValue: { alwaysVisible: false } }
]