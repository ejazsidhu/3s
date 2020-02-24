import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from "@environments/environment";
import { MainService } from "@videoDetail/services";
import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';


@Component({
  selector: 'video-detail-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css']
})
export class VideoDetailBreadcrumbsComponent implements OnInit, OnDestroy {

  public folders;
  public HuddleInfo;
  public translation: any = {};
  private translationSubscription: Subscription;
  workspace: boolean = false;
  public urls: any = {};
  isAssessment: boolean = false;

  constructor(private mainService: MainService, private headerService: HeaderService, private Aroute: ActivatedRoute) {
    this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
      this.translation = languageTranslation;
    });
  }

  ngOnInit() {
    this.Aroute.queryParams.subscribe(qparms => {
      qparms.workspace ? this.workspace = true : this.workspace = false

      if (qparms.assessment)
        this.isAssessment = true;

      console.log("bread crumb ", qparms)

    })
    if (this.workspace) {
      this.urls.huddlesUrl = '/workspace/workspace/home';
    } else {
      this.urls.huddlesUrl = '/video_huddles/list';
    }

    this.mainService.breadcrumbs.subscribe((data) => {

      this.folders = data;

    });
    this.mainService.huddleInfo.subscribe((data) => {
      this.HuddleInfo = data;
    });

    this.mainService.videoTitle$.subscribe((title: string) => {

      if (this.HuddleInfo) this.HuddleInfo.huddle_title = title;

    });

    // this.headerService.LoggedIn.subscribe((f)=>{

    //     if(f){
    //       this.header_data = this.headerService.getStaticHeaderData();
    //       this.translation = this.header_data.language_translation; // changed to observable stream
    //       console.log(this.translation);
    //     }

    //   })

  }

  public getHuddleUrl() {

    if (this.HuddleInfo) {
      if (this.workspace) {
        return '/workspace/workspace/home';
      }

      if (!this.isAssessment)
        return `/video_huddles/huddle/details/${this.HuddleInfo.account_folder_id}`;
      else
        return `/video_huddles/assessment/${this.HuddleInfo.account_folder_id}`;

      // else{
      //   // if(!this.isAssessment)
      // return `/video_huddles/huddle/details/${this.HuddleInfo.account_folder_id}`;
      // }

    }


    return "";

  }

  public GetFolderUrl(folder) {

    return `/video_huddles/list/${folder.folder_id}`;

  }

  ngOnDestroy() {
    this.translationSubscription.unsubscribe();
  }

}
