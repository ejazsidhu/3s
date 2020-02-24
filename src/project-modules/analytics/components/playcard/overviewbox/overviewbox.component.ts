import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { HeaderService } from "@projectModules/app/services";
import { Subscription } from 'rxjs';

@Component({
  selector: 'overviewbox',
  templateUrl: './overviewbox.component.html',
  styleUrls: ['./overviewbox.component.css']
})
export class OverviewboxComponent implements OnInit, OnDestroy {

	//public Config;
	public details;
	public translation: any = {};
	private translationSubscription: Subscription;
  	constructor(private headerService:HeaderService) { 
		this.translationSubscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
		});
	  }

  ngOnInit() {
	 this.details = [];
  }
	@Input() set config(val){

		this.prepare_details(val);
	};


	private prepare_details(val){
		if (!val) return;
		//if (!this.details) this.details = [];
		this.details = [];
		this.details.push({ iconUrl: "assets/img/huddles.svg", title: this.translation.analytics_huddles, value: val.total_account_huddles });
		this.details.push({ iconUrl: "assets/img/total_video_uploaded.svg", title:this.translation.analytics_total_videos_upload, value: val.total_account_videos });
		this.details.push({ iconUrl: "assets/img/comments_added.svg", title: this.translation.analytics_comment_added, value: val.total_comments_added });
		this.details.push({ iconUrl: "assets/img/video_view.svg", title: this.translation.analytics_video_views, value: val.total_viewed_videos });
		this.details.push({ iconUrl: "assets/img/total_video_uploaded.svg", title: this.translation.analytics_hours_uploaded, value: val.total_video_duration });
		this.details.push({ iconUrl: "assets/img/video_view.svg", title: this.translation.analytics_hours_viewed, value: val.total_min_watched });

	}

	ngOnDestroy(){
		this.translationSubscription.unsubscribe();
	  }  

}
