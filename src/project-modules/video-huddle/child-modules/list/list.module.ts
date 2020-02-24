import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { DndModule } from "ngx-drag-drop";

import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TreeModule } from 'angular-tree-component';
import { NgSlimScrollModule, SLIMSCROLL_DEFAULTS } from 'ngx-slimscroll';
import { ListRoutingModule } from './list-routing.module';
import { HomeComponent } from './home/home.component';
import { FolderThumbViewComponent } from './folder-thumb-view/folder-thumb-view.component';
import { HuddleThumbViewComponent } from './huddle-thumb-view/huddle-thumb-view.component';
import { HuddleListViewComponent } from './huddle-list-view/huddle-list-view.component';
import { FolderListViewComponent } from './folder-list-view/folder-list-view.component';
import { SearchPipe } from './pipes/search.pipe';

// import { HomeService } from "./services/home.service";
import { SessionService } from "./services/session.service";

import { FolderThumbLoadingComponent } from './folder-thumb-loading/folder-thumb-loading.component';
import { HuddleThumbLoadingComponent } from './huddle-thumb-loading/huddle-thumb-loading.component';
import { HuddleListLoadingComponent } from './huddle-list-loading/huddle-list-loading.component';
import { FolderListLoadingComponent } from './folder-list-loading/folder-list-loading.component';
import { HuddleThumbParticipantsComponent } from './huddle-thumb-participants/huddle-thumb-participants.component';

@NgModule({
	imports: [
		CommonModule,
		ListRoutingModule,
		FormsModule,
		BsDropdownModule.forRoot(),
		DndModule,
		TooltipModule.forRoot(),
		TreeModule.forRoot(),
		NgSlimScrollModule
	],
	declarations: [HomeComponent, FolderThumbViewComponent, HuddleThumbViewComponent, HuddleListViewComponent, FolderListViewComponent, SearchPipe, FolderThumbLoadingComponent, HuddleThumbLoadingComponent, HuddleListLoadingComponent, FolderListLoadingComponent, HuddleThumbParticipantsComponent],
	providers: [SessionService,    {
		provide: SLIMSCROLL_DEFAULTS,
		useValue: {
		  alwaysVisible : false
		}
	  }]
})
export class ListModule { }
