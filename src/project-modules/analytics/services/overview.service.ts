import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { catchError, map, tap } from 'rxjs/operators';
// import { Observable } from "rxjs";
// import { NgModule } from "@angular/core";
// import { of } from 'rxjs/observable/of';
import { environment } from "@environments/environment";
// = {
// 		"total_account_users": 1080,
// 		"total_account_huddles": 56,
// 		"total_account_videos": 713,
// 		"total_viewed_videos": 1056,
// 		"total_comments_added": 2149,
// 		"total_video_duration": 49.469999999999985,
// 		"total_min_watched": 7.35,
// 		"active_users": 18
// 	};

@Injectable()
export class OverviewService {

	constructor(private http: HttpClient) { }

	public getOverviewData(conf){
		//this.data = (<any>window).header_data;
		// let overview_url = (environment.APIbaseUrlDirect || environment.APIbaseUrl) + "/account_overview";

		let overview_url = (environment.APIbaseUrlDirect || environment.APIbaseUrl) + "/account_overview";
		return this.http.post(overview_url, conf);
	}

}
