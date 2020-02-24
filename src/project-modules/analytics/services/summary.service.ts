import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { HeaderService } from "@projectModules/app/services";
import { environment } from "@environments/environment";
import { BodyService } from "./body.service";
import { filter } from 'minimatch';

@Injectable()
export class SummaryService {

	@Output() Summary: EventEmitter<any> = new EventEmitter();

	constructor(private headerService: HeaderService, private http: HttpClient, private bodyService: BodyService) { }

  public LoadUserSummary(page=1, searchString?){
	// let path = (environment.APIbaseUrlDirect || environment.APIbaseUrl) + "/user_summary";

	  let path = (environment.APIbaseUrlDirect || environment.APIbaseUrl) + "/user_summary";
	  let that = this;

	//  let interval_id = setTimeout(function () {
	  	
		  let sessionData: any;
		  sessionData = that.headerService.getStaticHeaderData();

		  if (sessionData.user_current_account){

			  let filters: any;
			 // clearInterval(interval_id);
			  let sessionData: any = this.headerService.getStaticHeaderData();
			  filters = this.bodyService.GetFilters();
			  filters.filter_type = (filters.duration == -1) ? "custom" : "default";
			  filters.user_current_account = sessionData.user_current_account;
			  
			  filters.page = page;
			  filters.rows = 10;
			  filters.sidx = "account_name";
			  filters.sord = "asc";

			  if (!filters.subAccount) {

				  filters.subAccount = "";

			  }

			  if (searchString){
				  filters.search_text = searchString;
			  }else{
				  filters.search_text = "";
			  }
			  if (!filters.duration && filters.filter_type=="default") {

				  filters.duration = "4";

			  }

			  if(Number(filters.duration) > -1){


			  	filters.duration = function (d) {
			  		
			  		return d==12?4:d==6?3:d==3?2:1;

			  	}(filters.duration);

			  }

			return this.http.post(path, filters);

		  }

	 // }, 500);

  }

	public GetFile(filters){

		let path = environment.APIbaseUrl + "/export_user_summery";
		return this.http.post(path, filters, { responseType: 'text' } );

	}

  public EmitSummary(summary:any){

	  this.Summary.emit(summary);

  }

}
