import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from "@environments/environment";
import { MainService } from "../../services";
import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';

@Component({
  selector: 'workspace-video-page-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css']
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {

  public folders;
  public HuddleInfo;
  public header_data;
  public translation: any = {};
  private translationSubscription: Subscription;

  constructor(private mainService: MainService, private headerService: HeaderService) {
    this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
    });
  }

  ngOnInit() {

    this.mainService.breadcrumbs.subscribe((data) => {

      this.folders = data;

    });

    this.mainService.huddleInfo.subscribe((data) => {

      this.HuddleInfo = data;

    });

    this.mainService.videoTitle$.subscribe((title: string) => {

      if (this.HuddleInfo) this.HuddleInfo.huddle_title = title;

    });

    this.header_data = this.headerService.getStaticHeaderData();
    // this.translation = this.header_data.language_translation; // changed to observable stream
    // ;

  }

  // removing baseUrl to restrict hard-refresh
  // public getHuddleUrl() {

  //   if (this.HuddleInfo) {

  //     return environment.baseUrl + "/Huddles/view/" + this.HuddleInfo.account_folder_id;

  //   }

  //   return "";

  // }

  // removing baseUrl to restrict hard-refresh
  // public GetFolderUrl(folder) {

  //   return environment.baseUrl + "/Folder/" + folder.folder_id;

  // }

  ngOnDestroy() {
    this.translationSubscription.unsubscribe();
  }
}
