import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { ModalModule } from 'ngx-bootstrap/modal';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { NgSelectModule } from '@ng-select/ng-select';
import { TooltipModule, BsDropdownModule } from 'ngx-bootstrap';

import { PeopleHttpService, DataStorageService } from "@people/services";

import { GroupListComponent } from './group-list/group-list.component';
import { GroupSearchPipe } from './pipe/group-search.pipe';

export const __IMPORTS = [
    CommonModule,
    AccordionModule.forRoot(),
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    FormsModule,
    NgxPaginationModule,
    Ng2SearchPipeModule,
    NgSelectModule,
    MultiselectDropdownModule,
    TooltipModule,
    RouterModule
];

export const __DECLARATIONS = [GroupListComponent, GroupSearchPipe];

export const __PROVIDERS = [PeopleHttpService, DataStorageService]