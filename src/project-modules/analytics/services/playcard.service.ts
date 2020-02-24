import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { environment } from "@environments/environment";

@Injectable()
export class PlaycardService {
	private filtervalues;
	constructor(private http: HttpClient) {
		this.filtervalues = {};
	}


	public LoadPlaycard(conf) {

		let path = environment.APIbaseUrl + "/account_overview_by_user";

		return this.http.post(path, conf);

	}

	public Set_Filters(key, val) {

		this.filtervalues[key] = val;

	}
	public Delete_Filters(key) {
		delete this.filtervalues[key];
	}

	public Get_Filter(key) {
		return this.filtervalues[key];
	}

	public deleteAllFilters(){
		this.filtervalues = {};
	}

}

interface filters {

	range: string,
	start_date: string,
	end_date: string,
	date_range: Array<any>,
	coachee_view: string,
	framework: string,
	folder_type: string,
	standards: string

}
