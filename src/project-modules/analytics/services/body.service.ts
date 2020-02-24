import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HeaderService } from "@projectModules/app/services";
import { environment } from "@environments/environment";

@Injectable()
export class BodyService {

	private filtervals: filters;
	private PLs: Array<string>;

	@Output() triggerOverviewDataChange: EventEmitter<any> = new EventEmitter();
	@Output() FilterSubmitPressed: EventEmitter<any> = new EventEmitter();
	@Output() CommandTabChange: EventEmitter<any> = new EventEmitter();
	constructor(private headerService: HeaderService, private http: HttpClient) {
		this.filtervals = {};
	}


	public updateTab(val) {

		this.CommandTabChange.emit(val);

	}

	public BroadcastOverviewValues(values) {

		this.triggerOverviewDataChange.emit(values);

	}

	public UpdateFilters(key, val) {

		this.filtervals[key] = val;

	}

	public SetFilters(filters) {

		this.filtervals = filters;

	}

	public GetFilter(key) {

		return this.filtervals[key];

	}

	public GetFilters() {

		return this.filtervals;

	}

	public deleteFilter(key) {

		delete this.filtervals[key];

	}

	public deleteAllFilters() {
		this.filtervals = {};
	}

	public getChildAccounts() {

		let path = environment.APIbaseUrl + "/get_child_accounts";
		let sessionData: any;
		sessionData = this.headerService.getStaticHeaderData();
		let account_id = sessionData.user_current_account.users_accounts.account_id;

		return this.http.post(path, { account_id: account_id });

	}

	public GetSubFilters() {

		let path = environment.APIbaseUrl + "/get_child_accounts";
		let sessionData: any;
		sessionData = this.headerService.getStaticHeaderData();
		let account_id = sessionData.user_current_account.users_accounts.account_id;

		return this.http.post(path, {});
	}

	public GetCharts(filters) {

		let path = environment.APIbaseUrl + "/frequency_of_tagged_standard";

		return this.http.post(path, filters);

	}

	public LoadFilterDropdowns(acc = -1, user_id?) {

		let sessionData: any;
		sessionData = this.headerService.getStaticHeaderData();
		let account_id;
		if (acc == -1)
			account_id = sessionData.user_current_account.accounts.account_id;
		else account_id = acc;
		let obj: any = {};
		if (user_id) {
			obj.user_id = user_id;
		}
		let path = environment.APIbaseUrl + "/filters_dropdown/" + account_id;

		return this.http.post(path, obj);


	}

	public LoadStandards(framework_id) {

		let sessionData: any;
		sessionData = this.headerService.getStaticHeaderData();
		let account_id = sessionData.user_current_account.accounts.account_id;

		let path = environment.APIbaseUrl + "/getFramework/" + account_id + "/" + framework_id;

		return this.http.post(path, {});

	}

	public StorePLData(data: Array<string>) {

		this.PLs = data;

	}

	public GetPLData() {

		return this.PLs;

	}

	public UpdatePressed() {

		this.FilterSubmitPressed.emit(true);

	}
	/*
	  public Export(obj){
	
			let path = environment.APIbaseUrl+"/export_analytics_standards_to_excel";
	  	
			var form = document.createElement("form");
	    
		form.setAttribute("target", "_blank");
	    
		for(let k in obj){
	
			var input = document.createElement("input");
	    
			input.setAttribute("value", obj[k]);
		    
			input.setAttribute("name", k);
		    
			form.appendChild(input);
	
		}
	
		form.setAttribute("action", path);
	    
		form.setAttribute("method","post");
	    
		document.body.appendChild(form);
	
		form.submit();
	
		document.body.removeChild(form);
	
	  }
	*/
	public Export(obj) {
		let sessionData: any;
		sessionData = this.headerService.getStaticHeaderData();
		let account_id = sessionData.user_current_account.accounts.account_id;

		let path = environment.APIbaseUrl + "/export_analytics_standards_to_excel";

		return this.http.post(path, obj, { headers: { ignoreLoadingBar: '' } });
	}

	public is_download_ready(obj) {
		let sessionData: any;
		sessionData = this.headerService.getStaticHeaderData();
		let account_id = sessionData.user_current_account.accounts.account_id;

		let path = environment.APIbaseUrl + "/is_export_analytics_download_ready";

		return this.http.post(path, obj, { headers: { ignoreLoadingBar: '' } });
	}

	public download_analytics_standards_to_excel(obj) {
		// let path = environment.APIbaseUrl+"/download_analytics_standards_to_excel";
		console.log("Downloading....");
		console.log(obj);

		var link = document.createElement("a");
		link.href = obj.download_url;
		link.download = obj.file_name;
		document.body.appendChild(link);
		link.click();
		// var form = document.createElement("form");

		// form.setAttribute("target", "_blank");
		// for(let k in obj){
		// 	var input = document.createElement("input");
		// 	input.setAttribute("value", obj[k]);
		// 	input.setAttribute("name", k);
		// 	form.appendChild(input);
		// }

		// form.setAttribute("action", path);
		// form.setAttribute("method","post");
		// document.body.appendChild(form);
		// form.submit();
		document.body.removeChild(link);

	}

}

interface filters {

	[key: string]: any

}