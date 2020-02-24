import { NgModule, Component } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { VideoHuddleDetailsGridViewComponent } from "./grid-view/grid-view.component";
import { ListViewComponent } from "./list-view/list-view.component";
import { DiscussionsComponent } from "./discussions/discussions.component";
import { DiscussionDetailsComponent } from "./discussion-details/discussion-details.component";
import { DiscussionListComponent } from "./discussion-list/discussion-list.component";
import { ConferencingComponent } from './conferencing/conferencing.component';

const routes: Routes = [
  { path: "", redirectTo: "artifacts", pathMatch: "full" },
  {
    path: "artifacts",
    component: HomeComponent,
    children: [
      { path: "", redirectTo: "grid", pathMatch: "full" },
      { path: "grid", component: VideoHuddleDetailsGridViewComponent },
      { path: "list", component: ListViewComponent }
    ]
  },
  {
    path: "discussions",
    component: DiscussionsComponent,
    children: [
      { path: "", redirectTo: "list" },
      { path: "list", component: DiscussionListComponent },
      { path: "details/:discussion_id", component: DiscussionDetailsComponent }
    ]
  },
  { path: "conferencing", component: ConferencingComponent },
  
  {
    path: "**",
    component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DetailsRoutingModule {}
