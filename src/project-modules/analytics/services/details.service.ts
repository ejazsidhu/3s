import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { environment } from "@environments/environment";

@Injectable()
export class DetailsService {

	@Output() Filters: EventEmitter<any> = new EventEmitter();
	@Output() UpdateSelectedFilter: EventEmitter<string> = new EventEmitter<string>();
	@Output() FilterDropdowns: EventEmitter<any> = new EventEmitter();

	constructor(private http: HttpClient) { }

	public UpdateFilters(vals){

		this.Filters.emit(vals);
	}

	public LoadDetailsOnUpdate(conf, additional_data?){

		let path = environment.APIbaseUrl + "/userDetail";
		Object.keys(conf).forEach(k => {

			if (additional_data.startDate && k == "start_date") {

			} else {

				if (additional_data.endDate && k == "end_date") {

				} else {
					if (k != "workspace_huddle_library")
						if (k != "type")
							path = path + "/" + conf[k];
				}

			}

		});


			return this.http.post(path, additional_data);


	}

	public LoadDetails(conf, is_first=true, additional_data?){

		let path = environment.APIbaseUrl + "/userDetail";
		

		if (is_first) {
			Object.keys(conf).forEach(k => path = path + "/" + conf[k]);
			return this.http.post(path, {});
		}else{
			Object.keys(conf).forEach(k => {
				
				if (k == "type" || k == "workspace_huddle_library"){

					path = path + "/0";

				}
				else path = path + "/" + conf[k];

			});
			return this.http.post(path, additional_data);
		}

	}

	public LoadFilters(){

		let path = environment.APIbaseUrl + "/analytics_details_filter";

		return this.http.get(path);

	}

	public UpdateFiltersDropdown(filters){

		this.FilterDropdowns.emit(filters);

	}
	
	public UpdateSelectedFilterValue(str){

		this.UpdateSelectedFilter.emit(str);
	}



}
